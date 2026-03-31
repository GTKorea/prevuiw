import * as request from 'supertest';
import { createTestApp, createTestUser, closeTestApp, TestContext } from './helpers/setup';

describe('Project (e2e)', () => {
  let ctx: TestContext;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  beforeEach(async () => {
    const { user, token: t } = await createTestUser(ctx.prisma, ctx.jwtService, 'project');
    userId = user.id;
    token = t;
  });

  afterEach(async () => {
    await ctx.prisma.project.deleteMany({ where: { ownerId: userId } });
    await ctx.prisma.user.deleteMany({ where: { id: userId } });
  });

  afterAll(() => closeTestApp(ctx));

  describe('POST /projects', () => {
    it('should create a project when authenticated', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'My Test Project' })
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'My Test Project',
        ownerId: userId,
      });
      expect(response.body.slug).toBeDefined();
      expect(response.body.slug).toMatch(/^my-test-project-[a-f0-9]{16}$/);
    });

    it('should create a guest project without token', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post('/projects')
        .set('x-guest-id', `guest-e2e-${Date.now()}`)
        .send({ name: 'Guest Project' })
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Guest Project',
        isGuest: true,
      });
      expect(response.body.ownerId).toBeNull();
      expect(response.body.expiresAt).toBeDefined();

      // Clean up guest project
      await ctx.prisma.project.delete({ where: { id: response.body.id } });
    });
  });

  describe('GET /projects', () => {
    it('should list the authenticated user\'s projects', async () => {
      await request(ctx.app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Project Alpha' })
        .expect(201);

      await request(ctx.app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Project Beta' })
        .expect(201);

      const response = await request(ctx.app.getHttpServer())
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
      return request(ctx.app.getHttpServer())
        .get('/projects')
        .expect(401);
    });
  });

  describe('GET /projects/:slug', () => {
    it('should return the project without authentication (public access)', async () => {
      const createResponse = await request(ctx.app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Public Project' })
        .expect(201);

      const slug = createResponse.body.slug;

      const response = await request(ctx.app.getHttpServer())
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
      return request(ctx.app.getHttpServer())
        .get('/projects/non-existent-slug-abc123')
        .expect(404);
    });
  });

  describe('PATCH /projects/:slug', () => {
    it('should update project name when owner', async () => {
      const create = await request(ctx.app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Old Name' })
        .expect(201);

      const response = await request(ctx.app.getHttpServer())
        .patch(`/projects/${create.body.slug}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' })
        .expect(200);

      expect(response.body.name).toBe('New Name');
    });

    it('should return 401 without token', async () => {
      const create = await request(ctx.app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' })
        .expect(201);

      return request(ctx.app.getHttpServer())
        .patch(`/projects/${create.body.slug}`)
        .send({ name: 'Updated' })
        .expect(401);
    });

    it('should return 403 when non-owner tries to update', async () => {
      const create = await request(ctx.app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Owner Project' })
        .expect(201);

      const { user: other, token: otherToken } = await createTestUser(
        ctx.prisma, ctx.jwtService, 'other-project',
      );

      await request(ctx.app.getHttpServer())
        .patch(`/projects/${create.body.slug}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Hijacked' })
        .expect(403);

      await ctx.prisma.user.delete({ where: { id: other.id } });
    });

    it('should return 404 for non-existent slug', () => {
      return request(ctx.app.getHttpServer())
        .patch('/projects/non-existent-slug-abc123')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'X' })
        .expect(404);
    });
  });

  describe('DELETE /projects/:slug', () => {
    it('should delete project when owner', async () => {
      const create = await request(ctx.app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Delete' })
        .expect(201);

      await request(ctx.app.getHttpServer())
        .delete(`/projects/${create.body.slug}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      await request(ctx.app.getHttpServer())
        .get(`/projects/${create.body.slug}`)
        .expect(404);
    });

    it('should return 403 when non-owner tries to delete', async () => {
      const create = await request(ctx.app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Protected Project' })
        .expect(201);

      const { user: other, token: otherToken } = await createTestUser(
        ctx.prisma, ctx.jwtService, 'other-del',
      );

      await request(ctx.app.getHttpServer())
        .delete(`/projects/${create.body.slug}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      await ctx.prisma.user.delete({ where: { id: other.id } });
    });

    it('should return 401 without token', async () => {
      const create = await request(ctx.app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Auth Required' })
        .expect(201);

      return request(ctx.app.getHttpServer())
        .delete(`/projects/${create.body.slug}`)
        .expect(401);
    });
  });

  describe('POST /projects/:id/generate-key', () => {
    let projectId: string;

    beforeEach(async () => {
      const create = await request(ctx.app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Key Project' })
        .expect(201);
      projectId = create.body.id;
    });

    it('should generate a publishable key for a project', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post(`/projects/${projectId}/generate-key`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(response.body.publishableKey).toBeDefined();
      expect(response.body.publishableKey).toMatch(/^pk_/);
    });

    it('should regenerate key (invalidate old one)', async () => {
      const first = await request(ctx.app.getHttpServer())
        .post(`/projects/${projectId}/generate-key`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const second = await request(ctx.app.getHttpServer())
        .post(`/projects/${projectId}/generate-key`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(second.body.publishableKey).not.toBe(first.body.publishableKey);
    });
  });
});
