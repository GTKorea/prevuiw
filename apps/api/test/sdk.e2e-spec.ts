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

      const version = await ctx.prisma.version.create({
        data: {
          projectId: project.id,
          versionName: 'v1',
          url: 'https://example.com',
          urlType: 'MUTABLE',
          isActive: true,
        },
      });
      versionId = version.id;
    });

    it('should resolve version by project key and URL', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post('/sdk/resolve-version')
        .send({
          projectKey: publishableKey,
          currentUrl: 'https://example.com/page',
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
          currentUrl: 'https://example.com',
        })
        .expect(401);
    });

    it('should fall back to latest active version when URL does not match', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post('/sdk/resolve-version')
        .send({
          projectKey: publishableKey,
          currentUrl: 'https://nomatch.com/page',
        })
        .expect(200);

      expect(response.body.versionId).toBe(versionId);
    });
  });

  describe('SDK full flow', () => {
    let publishableKey: string;
    let versionId: string;

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

      const version = await ctx.prisma.version.create({
        data: {
          projectId: project.id,
          versionName: 'v1',
          url: 'https://staging.example.com',
          urlType: 'MUTABLE',
          isActive: true,
        },
      });
      versionId = version.id;
    });

    it('should resolve version, create comment with cssSelector, and retrieve it', async () => {
      // Step 1: Resolve version
      const resolved = await request(ctx.app.getHttpServer())
        .post('/sdk/resolve-version')
        .send({ projectKey: publishableKey, currentUrl: 'https://staging.example.com/about' })
        .expect(200);

      expect(resolved.body.versionId).toBe(versionId);

      // Step 2: Create comment with cssSelector
      const created = await request(ctx.app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .send({
          content: 'This button needs more padding',
          posX: 42.5,
          posY: 67.3,
          cssSelector: 'button.cta-primary',
          pageUrl: 'https://staging.example.com/about',
          guestName: 'Reviewer 1',
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
