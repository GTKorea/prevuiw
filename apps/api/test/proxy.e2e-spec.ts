import * as request from 'supertest';
import { createTestApp, closeTestApp, TestContext } from './helpers/setup';

describe('Proxy (e2e)', () => {
  let ctx: TestContext;
  let fetchSpy: jest.SpyInstance;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  afterAll(() => closeTestApp(ctx));

  describe('GET /proxy', () => {
    it('should return proxied HTML with injected base tag and script', async () => {
      fetchSpy.mockResolvedValue({
        headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
        text: async () => '<html><head><title>Test</title></head><body>Hello</body></html>',
      } as any);

      const response = await request(ctx.app.getHttpServer())
        .get('/proxy')
        .query({ url: 'https://example.com/page' })
        .expect(200);

      expect(response.text).toContain('<base href=');
      expect(response.text).toContain('<script>');
      expect(response.text).toContain('prevuiw:url');
    });

    it('should return 400 when url param is missing', () => {
      return request(ctx.app.getHttpServer())
        .get('/proxy')
        .expect(400);
    });

    it('should return 400 for localhost URL', () => {
      return request(ctx.app.getHttpServer())
        .get('/proxy')
        .query({ url: 'http://localhost:3000' })
        .expect(400);
    });

    it('should return 400 for non-HTTP protocol', () => {
      return request(ctx.app.getHttpServer())
        .get('/proxy')
        .query({ url: 'ftp://example.com/file' })
        .expect(400);
    });

    it('should return 400 for non-HTML content', async () => {
      fetchSpy.mockResolvedValue({
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{"ok": true}',
      } as any);

      return request(ctx.app.getHttpServer())
        .get('/proxy')
        .query({ url: 'https://example.com/api' })
        .expect(400);
    });

    it('should inject base+script even without head tag', async () => {
      fetchSpy.mockResolvedValue({
        headers: new Headers({ 'content-type': 'text/html' }),
        text: async () => '<html><body>No head here</body></html>',
      } as any);

      const response = await request(ctx.app.getHttpServer())
        .get('/proxy')
        .query({ url: 'https://example.com/nohead' })
        .expect(200);

      expect(response.text).toContain('<base href=');
      expect(response.text).toContain('<script>');
    });
  });
});
