import * as request from 'supertest';
import { createTestApp, createTestUser, closeTestApp, TestContext } from './helpers/setup';

describe('Reaction (e2e)', () => {
  let ctx: TestContext;
  let token: string;
  let userId: string;
  let commentId: string;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  beforeEach(async () => {
    const { user, token: t } = await createTestUser(ctx.prisma, ctx.jwtService, 'reaction');
    userId = user.id;
    token = t;

    const project = await ctx.prisma.project.create({
      data: {
        name: 'Reaction Test Project',
        slug: `reaction-test-${Date.now()}`,
        ownerId: userId,
      },
    });

    const version = await ctx.prisma.version.create({
      data: {
        projectId: project.id,
        versionName: 'v1.0',
        domain: 'https://example.com',
        versionKey: `vk-reaction-${Date.now()}`,
        inviteToken: `it-reaction-${Date.now()}`,
        isActive: true,
      },
    });

    const comment = await ctx.prisma.comment.create({
      data: {
        versionId: version.id,
        authorId: userId,
        content: 'Comment for reactions',
        posX: 10,
        posY: 20,
        viewport: 'DESKTOP_1920',
      },
    });
    commentId = comment.id;
  });

  afterEach(async () => {
    await ctx.prisma.reaction.deleteMany({ where: { userId } });
    await ctx.prisma.project.deleteMany({ where: { ownerId: userId } });
    await ctx.prisma.user.deleteMany({ where: { id: userId } });
  });

  afterAll(() => closeTestApp(ctx));

  describe('POST /comments/:commentId/reactions', () => {
    it('should add a reaction', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post(`/comments/${commentId}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ emoji: '👍' })
        .expect(201);

      expect(response.body).toMatchObject({ action: 'added' });
      expect(response.body.reaction).toBeDefined();
      expect(response.body.reaction.emoji).toBe('👍');
    });

    it('should toggle (remove) an existing reaction', async () => {
      await request(ctx.app.getHttpServer())
        .post(`/comments/${commentId}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ emoji: '👍' })
        .expect(201);

      const response = await request(ctx.app.getHttpServer())
        .post(`/comments/${commentId}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ emoji: '👍' })
        .expect(201);

      expect(response.body).toMatchObject({ action: 'removed' });
    });

    it('should allow different emojis on same comment', async () => {
      const r1 = await request(ctx.app.getHttpServer())
        .post(`/comments/${commentId}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ emoji: '👍' })
        .expect(201);

      const r2 = await request(ctx.app.getHttpServer())
        .post(`/comments/${commentId}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ emoji: '❤️' })
        .expect(201);

      expect(r1.body.action).toBe('added');
      expect(r2.body.action).toBe('added');
    });

    it('should return 401 without token', () => {
      return request(ctx.app.getHttpServer())
        .post(`/comments/${commentId}/reactions`)
        .send({ emoji: '👍' })
        .expect(401);
    });

    it('should return 400 with empty emoji', () => {
      return request(ctx.app.getHttpServer())
        .post(`/comments/${commentId}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ emoji: '' })
        .expect(400);
    });
  });
});
