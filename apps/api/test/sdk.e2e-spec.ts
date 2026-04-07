import * as request from 'supertest';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  TestContext,
} from './helpers/setup';

describe('SDK (e2e)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(() => closeTestApp(ctx));

  describe('GET /sdk.js', () => {
    it('should return JavaScript content', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/sdk.js')
        .expect(200);

      expect(response.headers['content-type']).toContain(
        'application/javascript',
      );
      expect(response.text.length).toBeGreaterThan(0);
    });

    it('should have CORS wildcard header', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/sdk.js')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    it('should have cache header', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/sdk.js')
        .expect(200);

      expect(response.headers['cache-control']).toContain('max-age=3600');
    });
  });

  describe('POST /sdk/resolve-version', () => {
    let publishableKey: string;
    let versionId: string;
    let versionKey: string;
    let inviteToken: string;

    beforeAll(async () => {
      const { user } = await createTestUser(
        ctx.prisma,
        ctx.jwtService,
        'sdk-resolve',
      );
      const project = await ctx.prisma.project.create({
        data: {
          name: 'SDK Resolve Test',
          slug: `sdk-resolve-${Date.now()}`,
          ownerId: user.id,
          publishableKey: `pk_${Date.now()}`,
        },
      });
      publishableKey = project.publishableKey!;

      versionKey = `vk-sdk-resolve-${Date.now()}`;
      inviteToken = `it-sdk-resolve-${Date.now()}`;

      const version = await ctx.prisma.version.create({
        data: {
          projectId: project.id,
          versionName: 'v1',
          domain: 'https://example.com',
          versionKey,
          inviteToken,
          isActive: true,
        },
      });
      versionId = version.id;
    });

    it('should resolve version by project key, version key, and invite token', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post('/sdk/resolve-version')
        .send({
          projectKey: publishableKey,
          versionKey,
          inviteToken,
        })
        .expect(200);

      expect(response.body.versionId).toBe(versionId);
      expect(response.body.projectId).toBeDefined();
    });

    it('should reject invalid project key', async () => {
      await request(ctx.app.getHttpServer())
        .post('/sdk/resolve-version')
        .send({
          projectKey: 'pk_invalid',
          versionKey,
          inviteToken,
        })
        .expect(401);
    });

    it('should reject invalid invite token', async () => {
      await request(ctx.app.getHttpServer())
        .post('/sdk/resolve-version')
        .send({
          projectKey: publishableKey,
          versionKey,
          inviteToken: 'invalid-token',
        })
        .expect(401);
    });

    it('should reject invalid version key', async () => {
      await request(ctx.app.getHttpServer())
        .post('/sdk/resolve-version')
        .send({
          projectKey: publishableKey,
          versionKey: 'invalid-vk',
          inviteToken,
        })
        .expect(401);
    });
  });

  describe('SDK full flow', () => {
    let publishableKey: string;
    let versionId: string;
    let versionKey: string;
    let inviteToken: string;

    beforeAll(async () => {
      const { user } = await createTestUser(ctx.prisma, ctx.jwtService, 'sdk-flow');
      const project = await ctx.prisma.project.create({
        data: {
          name: 'SDK Flow Test',
          slug: `sdk-flow-${Date.now()}`,
          ownerId: user.id,
          publishableKey: `pk_flow_${Date.now()}`,
        },
      });
      publishableKey = project.publishableKey!;

      versionKey = `vk-sdk-flow-${Date.now()}`;
      inviteToken = `it-sdk-flow-${Date.now()}`;

      const version = await ctx.prisma.version.create({
        data: {
          projectId: project.id,
          versionName: 'v1',
          domain: 'https://staging.example.com',
          versionKey,
          inviteToken,
          isActive: true,
        },
      });
      versionId = version.id;
    });

    it('should resolve version, create comment with cssSelector, and retrieve it', async () => {
      // Step 1: Resolve version
      const resolved = await request(ctx.app.getHttpServer())
        .post('/sdk/resolve-version')
        .send({ projectKey: publishableKey, versionKey, inviteToken })
        .expect(200);

      expect(resolved.body.versionId).toBe(versionId);

      // Step 2: Create comment with cssSelector
      const created = await request(ctx.app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .send({
          content: 'This button needs more padding',
          posX: 42.5,
          posY: 67.3,
          viewport: 'DESKTOP_1920',
          cssSelector: 'button.cta-primary',
          pageUrl: 'https://staging.example.com/about',
          reviewerName: 'Reviewer 1',
        })
        .expect(201);

      expect(created.body.cssSelector).toBe('button.cta-primary');
      expect(created.body.posX).toBe(42.5);

      // Step 3: Retrieve comments
      const list = await request(ctx.app.getHttpServer())
        .get(`/versions/${versionId}/comments`)
        .expect(200);

      const found = list.body.find((c: any) => c.id === created.body.id);
      expect(found).toBeDefined();
      expect(found.cssSelector).toBe('button.cta-primary');
    });
  });
});
