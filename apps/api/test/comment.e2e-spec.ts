import * as request from 'supertest';
import { createTestApp, createTestUser, closeTestApp, TestContext } from './helpers/setup';

describe('Comment (e2e)', () => {
  let ctx: TestContext;
  let token: string;
  let userId: string;
  let projectId: string;
  let versionId: string;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  beforeEach(async () => {
    const { user, token: t } = await createTestUser(ctx.prisma, ctx.jwtService, 'comment');
    userId = user.id;
    token = t;

    const project = await ctx.prisma.project.create({
      data: {
        name: 'Comment Test Project',
        slug: `comment-test-project-${Date.now()}`,
        ownerId: userId,
      },
    });
    projectId = project.id;

    const version = await ctx.prisma.version.create({
      data: {
        projectId,
        versionName: 'v1.0',
        domain: 'https://example.com',
        versionKey: `vk-comment-${Date.now()}`,
        inviteToken: `it-comment-${Date.now()}`,
        isActive: true,
      },
    });
    versionId = version.id;
  });

  afterEach(async () => {
    await ctx.prisma.comment.deleteMany({ where: { versionId } });
    await ctx.prisma.version.deleteMany({ where: { projectId } });
    await ctx.prisma.project.deleteMany({ where: { ownerId: userId } });
    await ctx.prisma.user.deleteMany({ where: { id: userId } });
  });

  afterAll(() => closeTestApp(ctx));

  describe('POST /versions/:versionId/comments', () => {
    it('should create a comment for an authenticated user', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'This is a test comment',
          posX: 100,
          posY: 200,
          viewport: 'DESKTOP_1920',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        content: 'This is a test comment',
        authorId: userId,
        posX: 100,
        posY: 200,
        viewport: 'DESKTOP_1920',
      });
      expect(response.body.author).toBeDefined();
      expect(response.body.author.id).toBe(userId);
    });

    it('should create a comment with reviewerName', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .send({
          content: 'Reviewer comment here',
          posX: 50,
          posY: 75,
          viewport: 'MOBILE_375',
          reviewerName: 'ReviewerUser',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        content: 'Reviewer comment here',
        reviewerName: 'ReviewerUser',
        posX: 50,
        posY: 75,
        viewport: 'MOBILE_375',
      });
      expect(response.body.authorId).toBeNull();
    });

    it('should create a reply with parentId', async () => {
      const parentResponse = await request(ctx.app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Root comment',
          posX: 100,
          posY: 200,
          viewport: 'DESKTOP_1920',
        })
        .expect(201);

      const parentId = parentResponse.body.id;

      const replyResponse = await request(ctx.app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Reply to root',
          posX: 100,
          posY: 200,
          viewport: 'DESKTOP_1920',
          parentId,
        })
        .expect(201);

      expect(replyResponse.body).toMatchObject({
        content: 'Reply to root',
        parentId,
      });
    });

    it('should store and return cssSelector when provided', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Selector test', posX: 50, posY: 50, viewport: 'DESKTOP_1920', cssSelector: '[data-testid="hero-title"]' })
        .expect(201);
      expect(response.body.cssSelector).toBe('[data-testid="hero-title"]');
    });
  });

  describe('PATCH /versions/:versionId/comments/:id/resolve', () => {
    it('should toggle isResolved on a comment', async () => {
      const createResponse = await request(ctx.app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Resolvable comment', posX: 10, posY: 10, viewport: 'DESKTOP_1920' })
        .expect(201);

      const commentId = createResponse.body.id;
      expect(createResponse.body.isResolved).toBe(false);

      const resolveResponse = await request(ctx.app.getHttpServer())
        .patch(`/versions/${versionId}/comments/${commentId}/resolve`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(resolveResponse.body.isResolved).toBe(true);
    });
  });

  describe('GET /versions/:versionId/comments', () => {
    it('should list root comments for a version', async () => {
      const root1 = await request(ctx.app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Root 1', posX: 1, posY: 1, viewport: 'DESKTOP_1920' })
        .expect(201);

      await request(ctx.app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Root 2', posX: 2, posY: 2, viewport: 'DESKTOP_1920' })
        .expect(201);

      await request(ctx.app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Reply 1', posX: 1, posY: 1, viewport: 'DESKTOP_1920', parentId: root1.body.id })
        .expect(201);

      const response = await request(ctx.app.getHttpServer())
        .get(`/versions/${versionId}/comments`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it('should filter comments by viewport', async () => {
      await request(ctx.app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Desktop comment', posX: 1, posY: 1, viewport: 'DESKTOP_1920' })
        .expect(201);

      await request(ctx.app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Mobile comment', posX: 1, posY: 1, viewport: 'MOBILE_375' })
        .expect(201);

      const desktopRes = await request(ctx.app.getHttpServer())
        .get(`/versions/${versionId}/comments?viewport=DESKTOP_1920`)
        .expect(200);

      expect(desktopRes.body).toHaveLength(1);
      expect(desktopRes.body[0].viewport).toBe('DESKTOP_1920');

      const mobileRes = await request(ctx.app.getHttpServer())
        .get(`/versions/${versionId}/comments?viewport=MOBILE_375`)
        .expect(200);

      expect(mobileRes.body).toHaveLength(1);
      expect(mobileRes.body[0].viewport).toBe('MOBILE_375');
    });
  });

  describe('DELETE /versions/:versionId/comments/:id', () => {
    it('should delete own comment', async () => {
      const create = await request(ctx.app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'To delete', posX: 5, posY: 5, viewport: 'DESKTOP_1920' })
        .expect(201);

      await request(ctx.app.getHttpServer())
        .delete(`/versions/${versionId}/comments/${create.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 401 without token', async () => {
      const comment = await ctx.prisma.comment.create({
        data: { versionId, authorId: userId, content: 'Auth required', posX: 5, posY: 5, viewport: 'DESKTOP_1920' },
      });

      return request(ctx.app.getHttpServer())
        .delete(`/versions/${versionId}/comments/${comment.id}`)
        .expect(401);
    });
  });
});
