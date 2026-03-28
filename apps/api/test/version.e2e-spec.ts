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

describe('Version (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let token: string;
  let userId: string;
  let projectId: string;

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
    // Create a test user and project before each test
    const user = await prisma.user.create({
      data: {
        email: `test-version-e2e-${Date.now()}@example.com`,
        name: 'Version E2E User',
        provider: 'GITHUB',
        providerId: `version-e2e-${Date.now()}`,
      },
    });
    userId = user.id;
    token = jwtService.sign({ sub: user.id, email: user.email });

    const project = await prisma.project.create({
      data: {
        name: 'Version Test Project',
        slug: `version-test-project-${Date.now()}`,
        ownerId: userId,
      },
    });
    projectId = project.id;
  });

  afterEach(async () => {
    // Clean up versions, project, and user after each test
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

  describe('POST /projects/:projectId/versions', () => {
    it('should create a version with IMMUTABLE urlType for Vercel-like URL', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          versionName: 'v1.0',
          url: 'https://my-app-abc123.vercel.app',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        projectId,
        versionName: 'v1.0',
        url: 'https://my-app-abc123.vercel.app',
        urlType: 'IMMUTABLE',
        isActive: true,
      });
    });

    it('should create a version with MUTABLE urlType for a regular URL', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          versionName: 'v1.0',
          url: 'https://example.com',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        projectId,
        versionName: 'v1.0',
        url: 'https://example.com',
        urlType: 'MUTABLE',
        isActive: true,
      });
    });

    it('should deactivate the previous active version when creating a new one', async () => {
      // Create first version
      const firstResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          versionName: 'v1.0',
          url: 'https://example.com/v1',
        })
        .expect(201);

      const firstVersionId = firstResponse.body.id;
      expect(firstResponse.body.isActive).toBe(true);

      // Create second version
      const secondResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          versionName: 'v2.0',
          url: 'https://example.com/v2',
        })
        .expect(201);

      expect(secondResponse.body.isActive).toBe(true);

      // Verify the first version is now inactive
      const firstVersion = await prisma.version.findUnique({
        where: { id: firstVersionId },
      });
      expect(firstVersion?.isActive).toBe(false);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .send({
          versionName: 'v1.0',
          url: 'https://example.com',
        })
        .expect(401);
    });

    it('should return 404 for non-existent project', async () => {
      return request(app.getHttpServer())
        .post(`/projects/00000000-0000-0000-0000-000000000000/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          versionName: 'v1.0',
          url: 'https://example.com',
        })
        .expect(404);
    });
  });

  describe('GET /projects/:projectId/versions', () => {
    it('should list versions ordered by createdAt desc', async () => {
      // Create two versions sequentially
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ versionName: 'v1.0', url: 'https://example.com/v1' })
        .expect(201);

      // Small delay to ensure different createdAt timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      await request(app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ versionName: 'v2.0', url: 'https://example.com/v2' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/versions`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      // Ordered by createdAt desc: v2.0 should come first
      expect(response.body[0].versionName).toBe('v2.0');
      expect(response.body[1].versionName).toBe('v1.0');
    });

    it('should list versions without authentication (public access)', async () => {
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ versionName: 'v1.0', url: 'https://example.com' })
        .expect(201);

      return request(app.getHttpServer())
        .get(`/projects/${projectId}/versions`)
        .expect(200);
    });
  });

  describe('GET /projects/:projectId/versions/:versionId', () => {
    it('should return a version by id without authentication', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ versionName: 'v1.0', url: 'https://example.com' })
        .expect(201);

      const versionId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/versions/${versionId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: versionId,
        versionName: 'v1.0',
        url: 'https://example.com',
      });
      expect(response.body.project).toBeDefined();
      expect(response.body.screenshots).toBeDefined();
    });

    it('should return 404 for non-existent version', () => {
      return request(app.getHttpServer())
        .get(`/projects/${projectId}/versions/00000000-0000-0000-0000-000000000000`)
        .expect(404);
    });
  });
});
