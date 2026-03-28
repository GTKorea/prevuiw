import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

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
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
  });

  describe('GET /auth/me', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should return user data with valid JWT token', async () => {
      // Create a test user in the DB
      const user = await prisma.user.create({
        data: {
          email: 'test-e2e@example.com',
          name: 'E2E Test User',
          provider: 'GITHUB',
          providerId: 'e2e-test-provider-id',
        },
      });

      // Sign a JWT for this user
      const token = jwtService.sign({ sub: user.id, email: user.email });

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });
  });
});
