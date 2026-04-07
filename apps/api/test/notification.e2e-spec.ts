import * as request from 'supertest';
import { createTestApp, createTestUser, closeTestApp, TestContext } from './helpers/setup';

describe('Notification (e2e)', () => {
  let ctx: TestContext;
  let token: string;
  let userId: string;
  let otherToken: string;
  let otherUserId: string;
  let notificationIds: string[];

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  beforeEach(async () => {
    const { user, token: t } = await createTestUser(ctx.prisma, ctx.jwtService, 'notif');
    userId = user.id;
    token = t;

    const { user: other, token: ot } = await createTestUser(ctx.prisma, ctx.jwtService, 'notif-other');
    otherUserId = other.id;
    otherToken = ot;

    // Create project -> version -> comment chain for notification FK
    const project = await ctx.prisma.project.create({
      data: {
        name: 'Notif Test Project',
        slug: `notif-test-${Date.now()}`,
        ownerId: otherUserId,
      },
    });

    const version = await ctx.prisma.version.create({
      data: {
        projectId: project.id,
        versionName: 'v1.0',
        domain: 'https://example.com',
        versionKey: `vk-notif-${Date.now()}`,
        inviteToken: `it-notif-${Date.now()}`,
        isActive: true,
      },
    });

    const comment = await ctx.prisma.comment.create({
      data: {
        versionId: version.id,
        authorId: otherUserId,
        content: 'Triggering comment',
        posX: 10,
        posY: 20,
        viewport: 'DESKTOP_1920',
      },
    });

    // Seed 3 notifications for userId: 2 unread, 1 read
    const n1 = await ctx.prisma.notification.create({
      data: { userId, commentId: comment.id, type: 'REPLY', isRead: false },
    });
    const n2 = await ctx.prisma.notification.create({
      data: { userId, commentId: comment.id, type: 'MENTION', isRead: false },
    });
    const n3 = await ctx.prisma.notification.create({
      data: { userId, commentId: comment.id, type: 'RESOLVE', isRead: true },
    });
    notificationIds = [n1.id, n2.id, n3.id];
  });

  afterEach(async () => {
    await ctx.prisma.notification.deleteMany({ where: { userId: { in: [userId, otherUserId] } } });
    await ctx.prisma.project.deleteMany({ where: { ownerId: { in: [userId, otherUserId] } } });
    await ctx.prisma.user.deleteMany({ where: { id: { in: [userId, otherUserId] } } });
  });

  afterAll(() => closeTestApp(ctx));

  describe('GET /notifications', () => {
    it('should return notifications for authenticated user', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('comment');
    });

    it('should not return another user\'s notifications', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });

    it('should return 401 without token', () => {
      return request(ctx.app.getHttpServer())
        .get('/notifications')
        .expect(401);
    });
  });

  describe('GET /notifications/unread-count', () => {
    it('should return correct unread count', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({ count: 2 });
    });

    it('should return 401 without token', () => {
      return request(ctx.app.getHttpServer())
        .get('/notifications/unread-count')
        .expect(401);
    });
  });

  describe('PATCH /notifications/:id/read', () => {
    it('should mark a single notification as read', async () => {
      await request(ctx.app.getHttpServer())
        .patch(`/notifications/${notificationIds[0]}/read`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const countResponse = await request(ctx.app.getHttpServer())
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(countResponse.body).toEqual({ count: 1 });
    });

    it('should not mark another user\'s notification', async () => {
      await request(ctx.app.getHttpServer())
        .patch(`/notifications/${notificationIds[0]}/read`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      // The unread count for original user should still be 2
      const countResponse = await request(ctx.app.getHttpServer())
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(countResponse.body).toEqual({ count: 2 });
    });
  });

  describe('PATCH /notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      await request(ctx.app.getHttpServer())
        .patch('/notifications/read-all')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const countResponse = await request(ctx.app.getHttpServer())
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(countResponse.body).toEqual({ count: 0 });
    });

    it('should return 401 without token', () => {
      return request(ctx.app.getHttpServer())
        .patch('/notifications/read-all')
        .expect(401);
    });
  });
});
