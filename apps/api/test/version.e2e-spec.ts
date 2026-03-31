import * as request from 'supertest';
import { createTestApp, createTestUser, closeTestApp, TestContext } from './helpers/setup';

describe('Version (e2e)', () => {
  let ctx: TestContext;
  let token: string;
  let userId: string;
  let projectId: string;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  beforeEach(async () => {
    const { user, token: t } = await createTestUser(ctx.prisma, ctx.jwtService, 'version');
    userId = user.id;
    token = t;

    const project = await ctx.prisma.project.create({
      data: {
        name: 'Version Test Project',
        slug: `version-test-project-${Date.now()}`,
        ownerId: userId,
      },
    });
    projectId = project.id;
  });

  afterEach(async () => {
    await ctx.prisma.version.deleteMany({ where: { projectId } });
    await ctx.prisma.project.deleteMany({ where: { ownerId: userId } });
    await ctx.prisma.user.deleteMany({ where: { id: userId } });
  });

  afterAll(() => closeTestApp(ctx));

  describe('POST /projects/:projectId/versions', () => {
    it('should create a version with IMMUTABLE urlType for Vercel-like URL', async () => {
      const response = await request(ctx.app.getHttpServer())
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
      const response = await request(ctx.app.getHttpServer())
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
      const firstResponse = await request(ctx.app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          versionName: 'v1.0',
          url: 'https://example.com/v1',
        })
        .expect(201);

      const firstVersionId = firstResponse.body.id;
      expect(firstResponse.body.isActive).toBe(true);

      const secondResponse = await request(ctx.app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          versionName: 'v2.0',
          url: 'https://example.com/v2',
        })
        .expect(201);

      expect(secondResponse.body.isActive).toBe(true);

      const firstVersion = await ctx.prisma.version.findUnique({
        where: { id: firstVersionId },
      });
      expect(firstVersion?.isActive).toBe(false);
    });

    it('should return 401 without token', () => {
      return request(ctx.app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .send({
          versionName: 'v1.0',
          url: 'https://example.com',
        })
        .expect(401);
    });

    it('should return 404 for non-existent project', async () => {
      return request(ctx.app.getHttpServer())
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
      await request(ctx.app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ versionName: 'v1.0', url: 'https://example.com/v1' })
        .expect(201);

      await new Promise((resolve) => setTimeout(resolve, 10));

      await request(ctx.app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ versionName: 'v2.0', url: 'https://example.com/v2' })
        .expect(201);

      const response = await request(ctx.app.getHttpServer())
        .get(`/projects/${projectId}/versions`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].versionName).toBe('v2.0');
      expect(response.body[1].versionName).toBe('v1.0');
    });

    it('should list versions without authentication (public access)', async () => {
      await request(ctx.app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ versionName: 'v1.0', url: 'https://example.com' })
        .expect(201);

      return request(ctx.app.getHttpServer())
        .get(`/projects/${projectId}/versions`)
        .expect(200);
    });
  });

  describe('GET /projects/:projectId/versions/:versionId', () => {
    it('should return a version by id without authentication', async () => {
      const createResponse = await request(ctx.app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ versionName: 'v1.0', url: 'https://example.com' })
        .expect(201);

      const versionId = createResponse.body.id;

      const response = await request(ctx.app.getHttpServer())
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
      return request(ctx.app.getHttpServer())
        .get(`/projects/${projectId}/versions/00000000-0000-0000-0000-000000000000`)
        .expect(404);
    });
  });
});
