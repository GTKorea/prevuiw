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

describe('Project (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let token: string;
  let userId: string;

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
    // Create a test user and issue a token before each test
    const user = await prisma.user.create({
      data: {
        email: `test-project-e2e-${Date.now()}@example.com`,
        name: 'Project E2E User',
        provider: 'GITHUB',
        providerId: `project-e2e-${Date.now()}`,
      },
    });
    userId = user.id;
    token = jwtService.sign({ sub: user.id, email: user.email });
  });

  afterEach(async () => {
    // Clean up projects and user after each test
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

  describe('POST /projects', () => {
    it('should create a project when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'My Test Project' })
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'My Test Project',
        ownerId: userId,
      });
      expect(response.body.slug).toBeDefined();
      expect(typeof response.body.slug).toBe('string');
      expect(response.body.slug).toMatch(/^my-test-project-[a-f0-9]{6}$/);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .send({ name: 'My Test Project' })
        .expect(401);
    });
  });

  describe('GET /projects', () => {
    it('should list the authenticated user\'s projects', async () => {
      // Create two projects first
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Project Alpha' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Project Beta' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('slug');
      expect(response.body[0]).toHaveProperty('ownerId', userId);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .expect(401);
    });
  });

  describe('GET /projects/:slug', () => {
    it('should return the project without authentication (public access)', async () => {
      // Create project first
      const createResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Public Project' })
        .expect(201);

      const slug = createResponse.body.slug;

      // Access without auth token
      const response = await request(app.getHttpServer())
        .get(`/projects/${slug}`)
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'Public Project',
        slug,
        ownerId: userId,
      });
      expect(response.body.owner).toBeDefined();
      expect(response.body.versions).toBeDefined();
    });

    it('should return 404 for non-existent slug', () => {
      return request(app.getHttpServer())
        .get('/projects/non-existent-slug-abc123')
        .expect(404);
    });
  });
});
