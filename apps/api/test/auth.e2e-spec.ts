import * as request from 'supertest';
import { createTestApp, closeTestApp, TestContext } from './helpers/setup';

describe('Auth (e2e)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(() => closeTestApp(ctx));

  describe('GET /auth/me', () => {
    it('should return 401 without token', () => {
      return request(ctx.app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should return user data with valid JWT token', async () => {
      const user = await ctx.prisma.user.create({
        data: {
          email: 'test-e2e@example.com',
          name: 'E2E Test User',
          provider: 'GITHUB',
          providerId: 'e2e-test-provider-id',
        },
      });

      const token = ctx.jwtService.sign({ sub: user.id, email: user.email });

      const response = await request(ctx.app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      await ctx.prisma.user.delete({ where: { id: user.id } });
    });
  });
});
