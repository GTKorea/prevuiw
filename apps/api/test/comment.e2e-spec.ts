import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { GoogleStrategy } from '@/auth/strategies/google.strategy';
import { GithubStrategy } from '@/auth/strategies/github.strategy';

// Stub strategies to avoid requiring real OAuth credentials in tests
class GoogleStrategyStub {
  name = 'google';
}

class GithubStrategyStub {
  name = 'github';
}

describe('Comment (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let token: string;
  let userId: string;
  let projectId: string;
  let versionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GoogleStrategy)
      .useClass(GoogleStrategyStub)
      .overrideProvider(GithubStrategy)
      .useClass(GithubStrategyStub)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        email: `test-comment-e2e-${Date.now()}@example.com`,
        name: 'Comment E2E User',
        provider: 'GITHUB',
        providerId: `comment-e2e-${Date.now()}`,
      },
    });
    userId = user.id;
    token = jwtService.sign({ sub: user.id, email: user.email });

    const project = await prisma.project.create({
      data: {
        name: 'Comment Test Project',
        slug: `comment-test-project-${Date.now()}`,
        ownerId: userId,
      },
    });
    projectId = project.id;

    const version = await prisma.version.create({
      data: {
        projectId,
        versionName: 'v1.0',
        url: 'https://example.com',
        urlType: 'MUTABLE',
        isActive: true,
      },
    });
    versionId = version.id;
  });

  afterEach(async () => {
    await prisma.comment.deleteMany({ where: { versionId } });
    await prisma.version.deleteMany({ where: { projectId } });
    await prisma.project.deleteMany({ where: { ownerId: userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
  });

  describe('POST /versions/:versionId/comments', () => {
    it('should create a comment for an authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'This is a test comment',
          posX: 100,
          posY: 200,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        content: 'This is a test comment',
        authorId: userId,
        posX: 100,
        posY: 200,
      });
      expect(response.body.author).toBeDefined();
      expect(response.body.author.id).toBe(userId);
    });

    it('should create a comment for a guest with guestName', async () => {
      const response = await request(app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .send({
          content: 'Guest comment here',
          posX: 50,
          posY: 75,
          guestName: 'GuestUser',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        content: 'Guest comment here',
        guestName: 'GuestUser',
        posX: 50,
        posY: 75,
      });
      expect(response.body.authorId).toBeNull();
    });

    it('should create a comment with selectionArea (drag)', async () => {
      const selectionArea = { x: 10, y: 20, width: 100, height: 50 };
      const response = await request(app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Comment with selection',
          posX: 10,
          posY: 20,
          selectionArea,
        })
        .expect(201);

      expect(response.body.selectionArea).toMatchObject(selectionArea);
    });

    it('should create a reply with parentId', async () => {
      // First create a root comment
      const parentResponse = await request(app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Root comment',
          posX: 100,
          posY: 200,
        })
        .expect(201);

      const parentId = parentResponse.body.id;

      const replyResponse = await request(app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Reply to root',
          posX: 100,
          posY: 200,
          parentId,
        })
        .expect(201);

      expect(replyResponse.body).toMatchObject({
        content: 'Reply to root',
        parentId,
      });
    });
  });

  describe('PATCH /versions/:versionId/comments/:id/resolve', () => {
    it('should toggle isResolved on a comment', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Resolvable comment',
          posX: 10,
          posY: 10,
        })
        .expect(201);

      const commentId = createResponse.body.id;
      expect(createResponse.body.isResolved).toBe(false);

      const resolveResponse = await request(app.getHttpServer())
        .patch(`/versions/${versionId}/comments/${commentId}/resolve`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(resolveResponse.body.isResolved).toBe(true);

      // Toggle back
      const unresolveResponse = await request(app.getHttpServer())
        .patch(`/versions/${versionId}/comments/${commentId}/resolve`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(unresolveResponse.body.isResolved).toBe(false);
    });
  });

  describe('GET /versions/:versionId/comments', () => {
    it('should list root comments for a version', async () => {
      // Create two root comments and one reply
      const root1 = await request(app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Root 1', posX: 1, posY: 1 })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Root 2', posX: 2, posY: 2 })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Reply 1', posX: 1, posY: 1, parentId: root1.body.id })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/versions/${versionId}/comments`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Only root comments (parentId=null) should be returned
      expect(response.body).toHaveLength(2);
      expect(response.body.every((c: any) => c.parentId === null)).toBe(true);
      // Check replies are nested
      const rootWithReply = response.body.find((c: any) => c.id === root1.body.id);
      expect(rootWithReply?.replies).toHaveLength(1);
      expect(rootWithReply?.replies[0].content).toBe('Reply 1');
    });
  });
});
