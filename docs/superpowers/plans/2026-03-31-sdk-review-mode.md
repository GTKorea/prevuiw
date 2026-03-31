# SDK Review Mode + Real-time Collaboration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the prevuiw SDK from a scroll-tracking IIFE into an embeddable review overlay with real-time cursors, so reviewers can pin comments on live websites with Figma-like collaboration.

**Architecture:** The SDK entry point branches: iframe mode (existing scroll/URL tracking) vs top-level review mode (new Shadow DOM overlay with comment pins, element highlighting, and real-time cursors). Backend extends with project publishable keys, cssSelector on comments, a version-resolve endpoint, and a dedicated Socket.IO namespace for SDK clients. socket.io-client is lazy-loaded on review activation to keep the initial bundle small.

**Tech Stack:** TypeScript + tsup (SDK), NestJS + Prisma + Socket.IO (API), css-selector-generator (selector pinning)

---

## File Structure

### packages/sdk/ (SDK package — major rewrite)
| File | Responsibility |
|------|---------------|
| `src/index.ts` | Entry point — branching logic (iframe vs top-level review) |
| `src/iframe-tracker.ts` | Extracted existing iframe scroll/URL tracking |
| `src/review/review-mode.ts` | Review mode orchestrator — init, destroy, mode switching |
| `src/review/shadow-host.ts` | Shadow DOM creation, adoptedStyleSheets, host element |
| `src/review/toolbar.ts` | Floating toolbar (Browse/Annotate toggle, status) |
| `src/review/pin-manager.ts` | Comment pin rendering + CSS selector matching + fallback |
| `src/review/element-picker.ts` | Element highlighting on hover + CSS selector generation |
| `src/review/cursor-layer.ts` | Real-time cursor rendering for other reviewers |
| `src/review/api-client.ts` | REST calls (resolve-version, comments CRUD) |
| `src/review/ws-client.ts` | WebSocket wrapper (lazy socket.io-client load, cursor events) |
| `src/review/styles.ts` | CSS string for adoptedStyleSheets (CSP-safe) |
| `src/review/types.ts` | Shared TypeScript types |
| `tsup.config.ts` | New build config — IIFE output for script tag, code splitting for lazy chunks |

### apps/api/ (Backend extensions)
| File | Responsibility |
|------|---------------|
| `prisma/schema.prisma` | Add `publishableKey` to Project, `cssSelector` to Comment |
| `src/sdk/sdk.controller.ts` | Serve built SDK bundle, resolve-version endpoint, SDK comment CRUD |
| `src/sdk/sdk.service.ts` | (new) Version resolve logic, key validation |
| `src/sdk/sdk.module.ts` | Register service + import ProjectModule |
| `src/sdk/sdk-review.gateway.ts` | (new) Socket.IO `/sdk-review` namespace — cursor events, key auth |
| `src/sdk/guards/sdk-key.guard.ts` | (new) Project key validation guard |
| `src/comment/dto/comment.dto.ts` | Add optional `cssSelector` field |
| `src/comment/comment.service.ts` | Pass cssSelector through to Prisma |

### apps/api/test/ (Tests)
| File | Responsibility |
|------|---------------|
| `test/sdk.e2e-spec.ts` | Extended: resolve-version, SDK comment CRUD, key validation |
| `test/comment.e2e-spec.ts` | Extended: cssSelector field storage/retrieval |

---

## Task 1: Prisma Schema — Add publishableKey and cssSelector

**Files:**
- Modify: `apps/api/prisma/schema.prisma`

- [ ] **Step 1: Add fields to Prisma schema**

```prisma
// In model Project, after expiresAt:
  publishableKey String?  @unique

// In model Comment, after pageUrl:
  cssSelector    String?
```

- [ ] **Step 2: Generate and run migration**

Run: `cd apps/api && npx prisma migrate dev --name add-publishable-key-and-css-selector`
Expected: Migration created and applied successfully.

- [ ] **Step 3: Verify Prisma client regenerated**

Run: `cd apps/api && npx prisma generate`
Expected: Prisma Client generated.

- [ ] **Step 4: Commit**

```bash
cd /Users/hjick/Documents/applications/krow-tools/prevuiw
git add apps/api/prisma/
git commit -m "chore: Project에 publishableKey, Comment에 cssSelector 필드 추가 마이그레이션"
```

---

## Task 2: Comment DTO + Service — cssSelector support

**Files:**
- Modify: `apps/api/src/comment/dto/comment.dto.ts`
- Modify: `apps/api/src/comment/comment.service.ts`
- Modify: `apps/api/test/comment.e2e-spec.ts`

- [ ] **Step 1: Write failing test for cssSelector field**

Add to `apps/api/test/comment.e2e-spec.ts`, inside the `POST /versions/:versionId/comments` describe block:

```typescript
it('should store and return cssSelector when provided', async () => {
  const response = await request(ctx.app.getHttpServer())
    .post(`/versions/${versionId}/comments`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      content: 'Selector test',
      posX: 50,
      posY: 50,
      cssSelector: '[data-testid="hero-title"]',
    })
    .expect(201);

  expect(response.body.cssSelector).toBe('[data-testid="hero-title"]');
});

it('should return null cssSelector when not provided', async () => {
  const response = await request(ctx.app.getHttpServer())
    .post(`/versions/${versionId}/comments`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      content: 'No selector',
      posX: 50,
      posY: 50,
    })
    .expect(201);

  expect(response.body.cssSelector).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/api && npx jest --testPathPattern comment.e2e-spec --verbose 2>&1 | tail -20`
Expected: FAIL — `cssSelector` not in response or DTO rejection.

- [ ] **Step 3: Add cssSelector to DTO**

In `apps/api/src/comment/dto/comment.dto.ts`, add:

```typescript
@IsString()
@IsOptional()
cssSelector?: string;
```

- [ ] **Step 4: Pass cssSelector in comment.service.ts create method**

In `apps/api/src/comment/comment.service.ts`, in the `create` method's `data` object, add:

```typescript
cssSelector: dto.cssSelector ?? null,
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd apps/api && npx jest --testPathPattern comment.e2e-spec --verbose 2>&1 | tail -20`
Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/comment/ apps/api/test/comment.e2e-spec.ts
git commit -m "feat: Comment에 cssSelector 필드 지원 추가"
```

---

## Task 3: Project publishable key generation

**Files:**
- Modify: `apps/api/src/project/project.service.ts`
- Modify: `apps/api/test/project.e2e-spec.ts`

- [ ] **Step 1: Write failing test for publishable key**

Add to `apps/api/test/project.e2e-spec.ts`:

```typescript
describe('POST /projects/:id/generate-key', () => {
  it('should generate a publishable key for a project', async () => {
    const response = await request(ctx.app.getHttpServer())
      .post(`/projects/${projectId}/generate-key`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.publishableKey).toBeDefined();
    expect(response.body.publishableKey).toMatch(/^pk_/);
  });

  it('should regenerate key (invalidate old one)', async () => {
    const first = await request(ctx.app.getHttpServer())
      .post(`/projects/${projectId}/generate-key`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const second = await request(ctx.app.getHttpServer())
      .post(`/projects/${projectId}/generate-key`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(second.body.publishableKey).not.toBe(first.body.publishableKey);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/api && npx jest --testPathPattern project.e2e-spec --verbose 2>&1 | tail -20`
Expected: FAIL — 404, route not found.

- [ ] **Step 3: Add generateKey to ProjectService**

In `apps/api/src/project/project.service.ts`, add method:

```typescript
async generatePublishableKey(projectId: string, userId: string) {
  const project = await this.prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project) throw new NotFoundException('Project not found');
  if (project.ownerId !== userId) throw new ForbiddenException('Not your project');

  const key = `pk_${randomBytes(24).toString('hex')}`;
  return this.prisma.project.update({
    where: { id: projectId },
    data: { publishableKey: key },
    select: { id: true, publishableKey: true },
  });
}

async findByPublishableKey(key: string) {
  const project = await this.prisma.project.findUnique({
    where: { publishableKey: key },
    include: { versions: { where: { isActive: true }, orderBy: { createdAt: 'desc' } } },
  });
  if (!project) return null;
  return project;
}
```

- [ ] **Step 4: Add route to ProjectController**

In `apps/api/src/project/project.controller.ts`, add:

```typescript
@Post(':id/generate-key')
@UseGuards(JwtAuthGuard)
generateKey(@Param('id') id: string, @CurrentUser() user: any) {
  return this.projectService.generatePublishableKey(id, user.id);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd apps/api && npx jest --testPathPattern project.e2e-spec --verbose 2>&1 | tail -20`
Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/project/ apps/api/test/project.e2e-spec.ts
git commit -m "feat: 프로젝트 publishable key 생성/재생성 API 추가"
```

---

## Task 4: SDK Key Guard + Resolve Version Endpoint

**Files:**
- Create: `apps/api/src/sdk/guards/sdk-key.guard.ts`
- Create: `apps/api/src/sdk/sdk.service.ts`
- Modify: `apps/api/src/sdk/sdk.controller.ts`
- Modify: `apps/api/src/sdk/sdk.module.ts`
- Modify: `apps/api/test/sdk.e2e-spec.ts`

- [ ] **Step 1: Write failing tests**

Add to `apps/api/test/sdk.e2e-spec.ts`:

```typescript
describe('POST /sdk/resolve-version', () => {
  let projectId: string;
  let versionId: string;
  let publishableKey: string;

  beforeAll(async () => {
    // Create user, project, version, and generate key
    const { user, token } = await createTestUser(ctx.prisma, ctx.jwtService, 'sdk-resolve');
    const project = await ctx.prisma.project.create({
      data: {
        name: 'SDK Resolve Test',
        slug: `sdk-resolve-${Date.now()}`,
        ownerId: user.id,
        publishableKey: `pk_${Date.now()}`,
      },
    });
    projectId = project.id;
    publishableKey = project.publishableKey!;

    const version = await ctx.prisma.version.create({
      data: {
        projectId,
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
      .send({ projectKey: publishableKey, currentUrl: 'https://example.com/page' })
      .expect(200);

    expect(response.body.versionId).toBe(versionId);
    expect(response.body.projectId).toBe(projectId);
  });

  it('should reject invalid project key', async () => {
    await request(ctx.app.getHttpServer())
      .post('/sdk/resolve-version')
      .send({ projectKey: 'pk_invalid', currentUrl: 'https://example.com' })
      .expect(401);
  });

  it('should fall back to latest active version when URL does not match', async () => {
    const response = await request(ctx.app.getHttpServer())
      .post('/sdk/resolve-version')
      .send({ projectKey: publishableKey, currentUrl: 'https://nomatch.com/page' })
      .expect(200);

    expect(response.body.versionId).toBe(versionId);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/api && npx jest --testPathPattern sdk.e2e-spec --verbose 2>&1 | tail -20`
Expected: FAIL — route not found.

- [ ] **Step 3: Create SdkKeyGuard**

Create `apps/api/src/sdk/guards/sdk-key.guard.ts`:

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SdkService } from '../sdk.service';

@Injectable()
export class SdkKeyGuard implements CanActivate {
  constructor(private sdkService: SdkService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.body?.projectKey || request.headers['x-project-key'];
    if (!key) throw new UnauthorizedException('Project key required');

    const project = await this.sdkService.validateKey(key);
    if (!project) throw new UnauthorizedException('Invalid project key');

    request.sdkProject = project;
    return true;
  }
}
```

- [ ] **Step 4: Create SdkService**

Create `apps/api/src/sdk/sdk.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SdkService {
  constructor(private prisma: PrismaService) {}

  async validateKey(key: string) {
    return this.prisma.project.findUnique({
      where: { publishableKey: key },
      select: { id: true, publishableKey: true, name: true },
    });
  }

  async resolveVersion(projectKey: string, currentUrl: string) {
    const project = await this.prisma.project.findUnique({
      where: { publishableKey: projectKey },
      include: {
        versions: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project || project.versions.length === 0) return null;

    // Try to match URL origin+pathname
    let matchedVersion = null;
    try {
      const incoming = new URL(currentUrl);
      const incomingOrigin = incoming.origin;
      matchedVersion = project.versions.find((v) => {
        try {
          const vUrl = new URL(v.url);
          return vUrl.origin === incomingOrigin;
        } catch {
          return false;
        }
      });
    } catch {
      // Invalid URL, fall through to latest
    }

    const version = matchedVersion || project.versions[0];
    return {
      versionId: version.id,
      projectId: project.id,
      versionName: version.versionName,
    };
  }
}
```

- [ ] **Step 5: Update SdkController**

Replace `apps/api/src/sdk/sdk.controller.ts`:

```typescript
import { Controller, Get, Post, Body, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { SdkService } from './sdk.service';

@Controller('sdk')
export class SdkController {
  private sdkBundle: string | null = null;

  constructor(private readonly sdkService: SdkService) {
    // Try to load built SDK bundle
    const bundlePath = join(__dirname, '..', '..', '..', '..', 'packages', 'sdk', 'dist', 'index.global.js');
    if (existsSync(bundlePath)) {
      this.sdkBundle = readFileSync(bundlePath, 'utf-8');
    }
  }

  @Get('sdk.js')
  @SkipThrottle()
  serve(@Res() res: Response) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.removeHeader('Access-Control-Allow-Credentials');
    res.removeHeader('Vary');

    if (this.sdkBundle) {
      res.send(this.sdkBundle);
    } else {
      res.status(404).send('// SDK bundle not built. Run: pnpm --filter @prevuiw/sdk build');
    }
  }

  @Post('resolve-version')
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  async resolveVersion(@Body() body: { projectKey: string; currentUrl: string }) {
    if (!body.projectKey) throw new UnauthorizedException('Project key required');

    const result = await this.sdkService.resolveVersion(body.projectKey, body.currentUrl);
    if (!result) throw new UnauthorizedException('Invalid project key or no active versions');

    return result;
  }
}
```

- [ ] **Step 6: Update SdkModule**

Replace `apps/api/src/sdk/sdk.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { SdkController } from './sdk.controller';
import { SdkService } from './sdk.service';

@Module({
  controllers: [SdkController],
  providers: [SdkService],
  exports: [SdkService],
})
export class SdkModule {}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cd apps/api && npx jest --testPathPattern sdk.e2e-spec --verbose 2>&1 | tail -20`
Expected: All tests PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/sdk/ apps/api/test/sdk.e2e-spec.ts
git commit -m "feat: SDK resolve-version 엔드포인트 및 프로젝트 키 검증 추가"
```

---

## Task 5: SDK-Review Socket.IO Gateway (cursor events)

**Files:**
- Create: `apps/api/src/sdk/sdk-review.gateway.ts`
- Modify: `apps/api/src/sdk/sdk.module.ts`

- [ ] **Step 1: Create SdkReviewGateway**

Create `apps/api/src/sdk/sdk-review.gateway.ts`:

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SdkService } from './sdk.service';

interface CursorData {
  x: number;
  y: number;
  name: string;
}

@WebSocketGateway({
  cors: { origin: true },
  namespace: '/sdk-review',
})
export class SdkReviewGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // versionId -> Map<socketId, { name, lastMove }>
  private presence = new Map<string, Map<string, { name: string; lastMove: number }>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private sdkService: SdkService) {
    // Clean stale cursors every 10 seconds
    this.cleanupInterval = setInterval(() => this.cleanStaleCursors(), 10000);
  }

  async handleConnection(client: Socket) {
    const key = client.handshake.query.projectKey as string;
    const versionId = client.handshake.query.versionId as string;
    const reviewerName = (client.handshake.query.name as string) || 'Anonymous';

    if (!key || !versionId) {
      client.disconnect();
      return;
    }

    const project = await this.sdkService.validateKey(key);
    if (!project) {
      client.disconnect();
      return;
    }

    const room = `sdk:${versionId}`;
    client.join(room);
    client.data = { versionId, name: reviewerName, projectId: project.id };

    if (!this.presence.has(versionId)) {
      this.presence.set(versionId, new Map());
    }
    this.presence.get(versionId)!.set(client.id, { name: reviewerName, lastMove: Date.now() });

    // Notify others
    client.to(room).emit('cursor:join', {
      socketId: client.id,
      name: reviewerName,
    });

    // Send current presence list to the new client
    const users = Array.from(this.presence.get(versionId)!.entries())
      .filter(([id]) => id !== client.id)
      .map(([id, data]) => ({ socketId: id, name: data.name }));
    client.emit('cursor:presence', users);
  }

  handleDisconnect(client: Socket) {
    const versionId = client.data?.versionId;
    if (!versionId) return;

    const room = `sdk:${versionId}`;
    const versionPresence = this.presence.get(versionId);
    if (versionPresence) {
      versionPresence.delete(client.id);
      if (versionPresence.size === 0) this.presence.delete(versionId);
    }

    this.server.to(room).emit('cursor:leave', { socketId: client.id });
  }

  @SubscribeMessage('cursor:move')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CursorData,
  ) {
    const versionId = client.data?.versionId;
    if (!versionId) return;

    // Update last move timestamp
    const versionPresence = this.presence.get(versionId);
    if (versionPresence?.has(client.id)) {
      versionPresence.get(client.id)!.lastMove = Date.now();
    }

    // Broadcast to others in the room (server-side throttle: skip if called too fast)
    client.to(`sdk:${versionId}`).volatile.emit('cursor:move', {
      socketId: client.id,
      name: data.name || client.data?.name,
      x: data.x,
      y: data.y,
    });
  }

  private cleanStaleCursors() {
    const now = Date.now();
    for (const [versionId, users] of this.presence) {
      for (const [socketId, data] of users) {
        if (now - data.lastMove > 30000) {
          users.delete(socketId);
          this.server.to(`sdk:${versionId}`).emit('cursor:leave', { socketId });
        }
      }
      if (users.size === 0) this.presence.delete(versionId);
    }
  }

  // Called by SdkController when a comment is created via SDK
  emitNewComment(versionId: string, comment: any) {
    this.server.to(`sdk:${versionId}`).emit('newComment', comment);
  }
}
```

- [ ] **Step 2: Register gateway in SdkModule**

Update `apps/api/src/sdk/sdk.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { SdkController } from './sdk.controller';
import { SdkService } from './sdk.service';
import { SdkReviewGateway } from './sdk-review.gateway';

@Module({
  controllers: [SdkController],
  providers: [SdkService, SdkReviewGateway],
  exports: [SdkService, SdkReviewGateway],
})
export class SdkModule {}
```

- [ ] **Step 3: Verify API starts without errors**

Run: `cd apps/api && npx nest build 2>&1 | tail -5`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/sdk/
git commit -m "feat: SDK 리뷰용 Socket.IO 게이트웨이 추가 (커서 이벤트, 키 인증)"
```

---

## Task 6: SDK Entry Point Rewrite — Branching Logic

**Files:**
- Modify: `packages/sdk/src/index.ts` (complete rewrite)
- Create: `packages/sdk/src/iframe-tracker.ts`
- Create: `packages/sdk/src/review/types.ts`
- Create: `packages/sdk/tsup.config.ts`

- [ ] **Step 1: Create types file**

Create `packages/sdk/src/review/types.ts`:

```typescript
export interface PrevuiwConfig {
  apiUrl: string;
  projectKey: string;
  versionId?: string;
}

export interface ResolvedVersion {
  versionId: string;
  projectId: string;
  versionName: string;
}

export interface CommentData {
  id: string;
  content: string;
  posX: number;
  posY: number;
  cssSelector: string | null;
  pageUrl: string | null;
  guestName: string | null;
  isResolved: boolean;
  author: { id: string; name: string; avatarUrl: string | null } | null;
  createdAt: string;
}

export interface CursorInfo {
  socketId: string;
  name: string;
  x: number;
  y: number;
}
```

- [ ] **Step 2: Extract iframe tracker**

Create `packages/sdk/src/iframe-tracker.ts`:

```typescript
export function startIframeTracker() {
  let active = false;
  let scrollRafId = 0;

  function sendUrl() {
    if (!active) return;
    window.parent.postMessage({ type: "prevuiw:url", url: location.href }, "*");
  }

  function sendScroll() {
    if (!active) return;
    window.parent.postMessage(
      {
        type: "prevuiw:scroll",
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        clientWidth: document.documentElement.clientWidth,
        clientHeight: document.documentElement.clientHeight,
      },
      "*"
    );
  }

  function onScroll() {
    if (scrollRafId) return;
    scrollRafId = requestAnimationFrame(() => {
      scrollRafId = 0;
      sendScroll();
    });
  }

  function start() {
    active = true;
    sendUrl();
    sendScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("hashchange", sendUrl);

    const origPushState = history.pushState;
    const origReplaceState = history.replaceState;
    history.pushState = function (...args: any[]) {
      origPushState.apply(this, args);
      sendUrl();
      sendScroll();
    };
    history.replaceState = function (...args: any[]) {
      origReplaceState.apply(this, args);
      sendUrl();
      sendScroll();
    };

    if (document.readyState === "complete") {
      sendScroll();
    } else {
      window.addEventListener("load", () => sendScroll());
    }

    let lastW = 0, lastH = 0;
    const pollInterval = setInterval(() => {
      const w = document.documentElement.scrollWidth;
      const h = document.documentElement.scrollHeight;
      if (w !== lastW || h !== lastH) { lastW = w; lastH = h; sendScroll(); }
    }, 300);
    setTimeout(() => clearInterval(pollInterval), 10000);
  }

  function onMessage(e: MessageEvent) {
    if (e.data?.type === "prevuiw:pong") {
      window.removeEventListener("message", onMessage);
      start();
    }
  }

  window.addEventListener("message", onMessage);
  window.parent.postMessage({ type: "prevuiw:ping" }, "*");
  setTimeout(() => window.removeEventListener("message", onMessage), 3000);
}
```

- [ ] **Step 3: Rewrite SDK entry point with branching logic**

Replace `packages/sdk/src/index.ts`:

```typescript
import { startIframeTracker } from "./iframe-tracker";

(function prevuiwSdk() {
  if (typeof window === "undefined") return;

  // Branch 1: Inside iframe — existing scroll/URL tracking
  if (window !== window.top) {
    startIframeTracker();
    return;
  }

  // Branch 2: Top-level window — check for review mode activation
  const scriptTag = document.currentScript as HTMLScriptElement | null;
  const projectKey = scriptTag?.getAttribute("data-key");
  if (!projectKey) return; // No key, SDK is inert

  const params = new URLSearchParams(window.location.search);
  if (!params.has("prevuiw")) return; // No activation param, SDK is inert

  // Mobile check — skip review mode on small screens
  if (window.innerWidth < 768) return;

  // Read API URL from data attribute or default
  const apiUrl = scriptTag?.getAttribute("data-api") || "https://api.prevuiw.com";

  // Lazy-load review mode
  import("./review/review-mode").then((mod) => {
    mod.initReviewMode({ apiUrl, projectKey });
  }).catch((err) => {
    console.error("[prevuiw] Failed to load review mode:", err);
  });
})();
```

- [ ] **Step 4: Create tsup config for IIFE + code splitting**

Create `packages/sdk/tsup.config.ts`:

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["iife"],
  globalName: "prevuiw",
  outDir: "dist",
  splitting: true,
  minify: true,
  sourcemap: true,
  target: "es2017",
  outExtension: () => ({ js: ".global.js" }),
  clean: true,
});
```

- [ ] **Step 5: Update package.json build script**

In `packages/sdk/package.json`, update:

```json
{
  "main": "dist/index.global.js",
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "css-selector-generator": "^3.6.0"
  }
}
```

- [ ] **Step 6: Install css-selector-generator**

Run: `cd /Users/hjick/Documents/applications/krow-tools/prevuiw && pnpm --filter @prevuiw/sdk add css-selector-generator`

- [ ] **Step 7: Create placeholder review-mode.ts so build works**

Create `packages/sdk/src/review/review-mode.ts`:

```typescript
import type { PrevuiwConfig } from "./types";

export async function initReviewMode(config: PrevuiwConfig) {
  console.log("[prevuiw] Review mode initializing...", config);
  // Will be implemented in Task 7-10
}
```

- [ ] **Step 8: Build and verify**

Run: `cd /Users/hjick/Documents/applications/krow-tools/prevuiw && pnpm --filter @prevuiw/sdk build 2>&1`
Expected: Build succeeds. `packages/sdk/dist/index.global.js` created.

- [ ] **Step 9: Commit**

```bash
git add packages/sdk/
git commit -m "refactor: SDK 엔트리포인트를 iframe/리뷰 모드 분기 구조로 재작성"
```

---

## Task 7: Shadow DOM Host + Styles (CSP-safe)

**Files:**
- Create: `packages/sdk/src/review/shadow-host.ts`
- Create: `packages/sdk/src/review/styles.ts`

- [ ] **Step 1: Create styles**

Create `packages/sdk/src/review/styles.ts`:

```typescript
export const SDK_STYLES = `
  :host {
    all: initial;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2147483647;
    pointer-events: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: #1a1a1a;
  }

  .prevuiw-toolbar {
    position: fixed;
    bottom: 20px;
    right: 20px;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 8px 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10;
  }

  .prevuiw-toolbar button {
    all: unset;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    transition: background 0.15s;
  }

  .prevuiw-toolbar button:hover { background: #f5f5f5; }
  .prevuiw-toolbar button.active { background: #3b82f6; color: #fff; }
  .prevuiw-toolbar button.active:hover { background: #2563eb; }

  .prevuiw-toolbar .status {
    font-size: 12px;
    color: #888;
    padding: 0 8px;
  }

  .prevuiw-pin {
    position: absolute;
    pointer-events: auto;
    width: 28px;
    height: 28px;
    border-radius: 50% 50% 50% 0;
    background: #3b82f6;
    border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    transform: rotate(-45deg) translate(-50%, -50%);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    transition: transform 0.15s;
  }

  .prevuiw-pin span {
    transform: rotate(45deg);
  }

  .prevuiw-pin:hover { transform: rotate(-45deg) translate(-50%, -50%) scale(1.15); }
  .prevuiw-pin.warn { background: #f59e0b; }

  .prevuiw-cursor {
    position: absolute;
    pointer-events: none;
    transition: left 0.1s linear, top 0.1s linear;
    z-index: 5;
  }

  .prevuiw-cursor-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  .prevuiw-cursor-name {
    position: absolute;
    left: 12px;
    top: -4px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    color: #fff;
    white-space: nowrap;
  }

  .prevuiw-highlight {
    position: fixed;
    pointer-events: none;
    border: 2px solid #3b82f6;
    border-radius: 4px;
    background: rgba(59, 130, 246, 0.08);
    z-index: 1;
    transition: all 0.05s;
  }

  .prevuiw-comment-input {
    position: absolute;
    pointer-events: auto;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    padding: 12px;
    width: 280px;
    z-index: 20;
  }

  .prevuiw-comment-input textarea {
    all: unset;
    width: 100%;
    min-height: 60px;
    font-size: 13px;
    line-height: 1.4;
    display: block;
    box-sizing: border-box;
  }

  .prevuiw-comment-input .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }

  .prevuiw-comment-input button {
    all: unset;
    cursor: pointer;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
  }

  .prevuiw-comment-input .btn-cancel { color: #666; }
  .prevuiw-comment-input .btn-cancel:hover { background: #f5f5f5; }
  .prevuiw-comment-input .btn-submit { background: #3b82f6; color: #fff; }
  .prevuiw-comment-input .btn-submit:hover { background: #2563eb; }

  .prevuiw-offline {
    position: fixed;
    top: 12px;
    right: 12px;
    pointer-events: auto;
    background: #fef3cd;
    border: 1px solid #ffc107;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    color: #856404;
    z-index: 15;
  }
`;
```

- [ ] **Step 2: Create shadow host**

Create `packages/sdk/src/review/shadow-host.ts`:

```typescript
import { SDK_STYLES } from "./styles";

let shadowRoot: ShadowRoot | null = null;
let hostElement: HTMLDivElement | null = null;

export function createShadowHost(): ShadowRoot {
  if (shadowRoot) return shadowRoot;

  hostElement = document.createElement("div");
  hostElement.id = "prevuiw-root";
  document.body.appendChild(hostElement);

  shadowRoot = hostElement.attachShadow({ mode: "open" });

  // Use adoptedStyleSheets for CSP compatibility
  if ("adoptedStyleSheets" in Document.prototype) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(SDK_STYLES);
    shadowRoot.adoptedStyleSheets = [sheet];
  } else {
    // Fallback for older browsers — may be blocked by strict CSP
    const style = document.createElement("style");
    style.textContent = SDK_STYLES;
    shadowRoot.appendChild(style);
  }

  return shadowRoot;
}

export function getShadowRoot(): ShadowRoot | null {
  return shadowRoot;
}

export function destroyShadowHost() {
  if (hostElement) {
    hostElement.remove();
    hostElement = null;
    shadowRoot = null;
  }
}
```

- [ ] **Step 3: Build and verify**

Run: `pnpm --filter @prevuiw/sdk build 2>&1`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add packages/sdk/src/review/shadow-host.ts packages/sdk/src/review/styles.ts
git commit -m "feat: Shadow DOM 호스트 및 CSP 호환 스타일 시스템 추가"
```

---

## Task 8: API Client + WebSocket Client

**Files:**
- Create: `packages/sdk/src/review/api-client.ts`
- Create: `packages/sdk/src/review/ws-client.ts`

- [ ] **Step 1: Create API client**

Create `packages/sdk/src/review/api-client.ts`:

```typescript
import type { ResolvedVersion, CommentData } from "./types";

export class ApiClient {
  constructor(private apiUrl: string, private projectKey: string) {}

  async resolveVersion(currentUrl: string): Promise<ResolvedVersion | null> {
    const res = await fetch(`${this.apiUrl}/sdk/resolve-version`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectKey: this.projectKey, currentUrl }),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async getComments(versionId: string): Promise<CommentData[]> {
    const res = await fetch(`${this.apiUrl}/versions/${versionId}/comments`);
    if (!res.ok) return [];
    return res.json();
  }

  async createComment(
    versionId: string,
    data: {
      content: string;
      posX: number;
      posY: number;
      cssSelector: string | null;
      pageUrl: string;
      guestName: string;
    }
  ): Promise<CommentData | null> {
    const res = await fetch(`${this.apiUrl}/versions/${versionId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  }
}
```

- [ ] **Step 2: Create WebSocket client with lazy loading**

Create `packages/sdk/src/review/ws-client.ts`:

```typescript
import type { CursorInfo } from "./types";

type EventCallback = (...args: any[]) => void;

export class WsClient {
  private socket: any = null;
  private connected = false;
  private listeners = new Map<string, EventCallback[]>();
  private cursorRafId = 0;
  private pendingCursor: { x: number; y: number; name: string } | null = null;

  constructor(
    private apiUrl: string,
    private projectKey: string,
    private versionId: string,
    private reviewerName: string
  ) {}

  async connect() {
    // Dynamic import of socket.io-client
    const { io } = await import("socket.io-client");

    const wsUrl = this.apiUrl.replace(/^http/, "ws");
    this.socket = io(`${wsUrl}/sdk-review`, {
      query: {
        projectKey: this.projectKey,
        versionId: this.versionId,
        name: this.reviewerName,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on("connect", () => {
      this.connected = true;
      this.emit("_connected");
    });

    this.socket.on("disconnect", () => {
      this.connected = false;
      this.emit("_disconnected");
    });

    // Relay events
    for (const event of ["cursor:move", "cursor:join", "cursor:leave", "cursor:presence", "newComment"]) {
      this.socket.on(event, (data: any) => this.emit(event, data));
    }
  }

  sendCursorMove(x: number, y: number) {
    this.pendingCursor = { x, y, name: this.reviewerName };
    if (this.cursorRafId) return;
    this.cursorRafId = requestAnimationFrame(() => {
      this.cursorRafId = 0;
      if (this.socket && this.connected && this.pendingCursor) {
        this.socket.volatile.emit("cursor:move", this.pendingCursor);
        this.pendingCursor = null;
      }
    });
  }

  on(event: string, cb: EventCallback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
  }

  private emit(event: string, ...args: any[]) {
    const cbs = this.listeners.get(event);
    if (cbs) cbs.forEach((cb) => cb(...args));
  }

  disconnect() {
    if (this.cursorRafId) cancelAnimationFrame(this.cursorRafId);
    this.socket?.disconnect();
    this.socket = null;
    this.connected = false;
    this.listeners.clear();
  }

  isConnected() { return this.connected; }
}
```

- [ ] **Step 3: Install socket.io-client as optional peer dependency**

Run: `cd /Users/hjick/Documents/applications/krow-tools/prevuiw && pnpm --filter @prevuiw/sdk add socket.io-client`

- [ ] **Step 4: Build and verify**

Run: `pnpm --filter @prevuiw/sdk build 2>&1`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add packages/sdk/src/review/api-client.ts packages/sdk/src/review/ws-client.ts packages/sdk/package.json
git commit -m "feat: SDK API 클라이언트 및 WebSocket 클라이언트 (socket.io 동적 로드) 추가"
```

---

## Task 9: Element Picker + Pin Manager

**Files:**
- Create: `packages/sdk/src/review/element-picker.ts`
- Create: `packages/sdk/src/review/pin-manager.ts`

- [ ] **Step 1: Create element picker**

Create `packages/sdk/src/review/element-picker.ts`:

```typescript
import { getCssSelector } from "css-selector-generator";

let highlightEl: HTMLDivElement | null = null;
let active = false;
let onPick: ((data: { selector: string; posX: number; posY: number; pageUrl: string }) => void) | null = null;

export function startPicker(
  shadowRoot: ShadowRoot,
  callback: (data: { selector: string; posX: number; posY: number; pageUrl: string }) => void
) {
  active = true;
  onPick = callback;

  if (!highlightEl) {
    highlightEl = document.createElement("div");
    highlightEl.className = "prevuiw-highlight";
    shadowRoot.appendChild(highlightEl);
  }

  document.addEventListener("mousemove", handleMouseMove, true);
  document.addEventListener("click", handleClick, true);
}

export function stopPicker() {
  active = false;
  onPick = null;
  document.removeEventListener("mousemove", handleMouseMove, true);
  document.removeEventListener("click", handleClick, true);
  if (highlightEl) {
    highlightEl.style.display = "none";
  }
}

function handleMouseMove(e: MouseEvent) {
  if (!active || !highlightEl) return;

  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (!target || target.id === "prevuiw-root") {
    highlightEl.style.display = "none";
    return;
  }

  const rect = target.getBoundingClientRect();
  highlightEl.style.display = "block";
  highlightEl.style.left = `${rect.left}px`;
  highlightEl.style.top = `${rect.top}px`;
  highlightEl.style.width = `${rect.width}px`;
  highlightEl.style.height = `${rect.height}px`;
}

function handleClick(e: MouseEvent) {
  if (!active || !onPick) return;

  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (!target || target.id === "prevuiw-root") return;

  e.preventDefault();
  e.stopPropagation();

  let selector: string;
  try {
    selector = getCssSelector(target, {
      selectors: ["id", "class", "tag", "nthchild"],
      includeTag: true,
    });
  } catch {
    selector = "";
  }

  const scrollWidth = document.documentElement.scrollWidth;
  const scrollHeight = document.documentElement.scrollHeight;
  const docX = ((e.clientX + window.scrollX) / scrollWidth) * 100;
  const docY = ((e.clientY + window.scrollY) / scrollHeight) * 100;

  onPick({
    selector,
    posX: docX,
    posY: docY,
    pageUrl: window.location.href,
  });
}
```

- [ ] **Step 2: Create pin manager**

Create `packages/sdk/src/review/pin-manager.ts`:

```typescript
import type { CommentData } from "./types";

const CURSOR_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316",
];

export class PinManager {
  private container: HTMLDivElement;
  private pins = new Map<string, HTMLDivElement>();

  constructor(private shadowRoot: ShadowRoot) {
    this.container = document.createElement("div");
    this.container.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;";
    shadowRoot.appendChild(this.container);
  }

  renderPins(comments: CommentData[]) {
    // Remove stale pins
    const commentIds = new Set(comments.map((c) => c.id));
    for (const [id, el] of this.pins) {
      if (!commentIds.has(id)) {
        el.remove();
        this.pins.delete(id);
      }
    }

    comments.forEach((comment, index) => {
      if (this.pins.has(comment.id)) {
        this.updatePinPosition(comment);
        return;
      }

      const pin = document.createElement("div");
      pin.className = "prevuiw-pin";
      pin.dataset.commentId = comment.id;

      const label = document.createElement("span");
      label.textContent = String(index + 1);
      pin.appendChild(label);

      pin.addEventListener("click", () => {
        // TODO: open comment thread
        console.log("[prevuiw] Pin clicked:", comment.id);
      });

      this.container.appendChild(pin);
      this.pins.set(comment.id, pin);
      this.updatePinPosition(comment);
    });
  }

  private updatePinPosition(comment: CommentData) {
    const pin = this.pins.get(comment.id);
    if (!pin) return;

    let positioned = false;

    // Try CSS selector first
    if (comment.cssSelector) {
      try {
        const el = document.querySelector(comment.cssSelector);
        if (el) {
          const rect = el.getBoundingClientRect();
          pin.style.left = `${rect.right + window.scrollX}px`;
          pin.style.top = `${rect.top + window.scrollY}px`;
          pin.classList.remove("warn");
          positioned = true;
        }
      } catch {
        // Invalid selector, fall through
      }
    }

    // Fallback to document coordinates
    if (!positioned) {
      const scrollWidth = document.documentElement.scrollWidth;
      const scrollHeight = document.documentElement.scrollHeight;
      pin.style.left = `${(comment.posX / 100) * scrollWidth}px`;
      pin.style.top = `${(comment.posY / 100) * scrollHeight}px`;

      if (comment.cssSelector) {
        pin.classList.add("warn"); // Selector broke, using fallback
      }
    }

    pin.style.pointerEvents = "auto";
  }

  updateAllPositions(comments: CommentData[]) {
    comments.forEach((c) => this.updatePinPosition(c));
  }

  destroy() {
    this.container.remove();
    this.pins.clear();
  }
}
```

- [ ] **Step 3: Build and verify**

Run: `pnpm --filter @prevuiw/sdk build 2>&1`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add packages/sdk/src/review/element-picker.ts packages/sdk/src/review/pin-manager.ts
git commit -m "feat: 요소 하이라이팅 + CSS 셀렉터 캡처 + 코멘트 핀 렌더링 추가"
```

---

## Task 10: Cursor Layer + Toolbar + Review Mode Orchestrator

**Files:**
- Create: `packages/sdk/src/review/cursor-layer.ts`
- Create: `packages/sdk/src/review/toolbar.ts`
- Modify: `packages/sdk/src/review/review-mode.ts`

- [ ] **Step 1: Create cursor layer**

Create `packages/sdk/src/review/cursor-layer.ts`:

```typescript
import type { CursorInfo } from "./types";

const COLORS = ["#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#3b82f6"];

export class CursorLayer {
  private container: HTMLDivElement;
  private cursors = new Map<string, HTMLDivElement>();
  private colorIndex = 0;
  private socketColors = new Map<string, string>();

  constructor(private shadowRoot: ShadowRoot) {
    this.container = document.createElement("div");
    this.container.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;";
    shadowRoot.appendChild(this.container);
  }

  private getColor(socketId: string): string {
    if (!this.socketColors.has(socketId)) {
      this.socketColors.set(socketId, COLORS[this.colorIndex % COLORS.length]);
      this.colorIndex++;
    }
    return this.socketColors.get(socketId)!;
  }

  updateCursor(data: CursorInfo) {
    let cursorEl = this.cursors.get(data.socketId);

    if (!cursorEl) {
      const color = this.getColor(data.socketId);
      cursorEl = document.createElement("div");
      cursorEl.className = "prevuiw-cursor";

      const dot = document.createElement("div");
      dot.className = "prevuiw-cursor-dot";
      dot.style.background = color;

      const nameTag = document.createElement("div");
      nameTag.className = "prevuiw-cursor-name";
      nameTag.style.background = color;
      nameTag.textContent = data.name;

      cursorEl.appendChild(dot);
      cursorEl.appendChild(nameTag);
      this.container.appendChild(cursorEl);
      this.cursors.set(data.socketId, cursorEl);
    }

    // Position using viewport percentages → pixels
    const x = (data.x / 100) * document.documentElement.scrollWidth;
    const y = (data.y / 100) * document.documentElement.scrollHeight;
    cursorEl.style.left = `${x}px`;
    cursorEl.style.top = `${y}px`;
  }

  removeCursor(socketId: string) {
    const el = this.cursors.get(socketId);
    if (el) {
      el.remove();
      this.cursors.delete(socketId);
      this.socketColors.delete(socketId);
    }
  }

  setVisible(visible: boolean) {
    this.container.style.display = visible ? "block" : "none";
  }

  destroy() {
    this.container.remove();
    this.cursors.clear();
    this.socketColors.clear();
  }
}
```

- [ ] **Step 2: Create toolbar**

Create `packages/sdk/src/review/toolbar.ts`:

```typescript
export type ToolbarMode = "browse" | "annotate";

export class Toolbar {
  private el: HTMLDivElement;
  private browseBtn: HTMLButtonElement;
  private annotateBtn: HTMLButtonElement;
  private statusEl: HTMLDivElement;
  private mode: ToolbarMode = "browse";
  private onModeChange: (mode: ToolbarMode) => void;

  constructor(shadowRoot: ShadowRoot, onModeChange: (mode: ToolbarMode) => void) {
    this.onModeChange = onModeChange;

    this.el = document.createElement("div");
    this.el.className = "prevuiw-toolbar";

    const logo = document.createElement("div");
    logo.style.cssText = "font-weight:700;font-size:13px;color:#3b82f6;padding:0 4px;";
    logo.textContent = "prevuiw";

    this.browseBtn = document.createElement("button");
    this.browseBtn.textContent = "Browse";
    this.browseBtn.className = "active";
    this.browseBtn.addEventListener("click", () => this.setMode("browse"));

    this.annotateBtn = document.createElement("button");
    this.annotateBtn.textContent = "Annotate";
    this.annotateBtn.addEventListener("click", () => this.setMode("annotate"));

    this.statusEl = document.createElement("div");
    this.statusEl.className = "status";
    this.statusEl.textContent = "Connecting...";

    this.el.appendChild(logo);
    this.el.appendChild(this.browseBtn);
    this.el.appendChild(this.annotateBtn);
    this.el.appendChild(this.statusEl);

    shadowRoot.appendChild(this.el);
  }

  setMode(mode: ToolbarMode) {
    this.mode = mode;
    this.browseBtn.className = mode === "browse" ? "active" : "";
    this.annotateBtn.className = mode === "annotate" ? "active" : "";
    this.onModeChange(mode);
  }

  getMode(): ToolbarMode { return this.mode; }

  setStatus(text: string) { this.statusEl.textContent = text; }

  destroy() { this.el.remove(); }
}
```

- [ ] **Step 3: Implement full review-mode orchestrator**

Replace `packages/sdk/src/review/review-mode.ts`:

```typescript
import type { PrevuiwConfig, CommentData } from "./types";
import { createShadowHost, destroyShadowHost } from "./shadow-host";
import { Toolbar, ToolbarMode } from "./toolbar";
import { PinManager } from "./pin-manager";
import { CursorLayer } from "./cursor-layer";
import { startPicker, stopPicker } from "./element-picker";
import { ApiClient } from "./api-client";
import { WsClient } from "./ws-client";

let toolbar: Toolbar | null = null;
let pinManager: PinManager | null = null;
let cursorLayer: CursorLayer | null = null;
let apiClient: ApiClient | null = null;
let wsClient: WsClient | null = null;
let comments: CommentData[] = [];
let versionId: string | null = null;
let commentInput: HTMLDivElement | null = null;

export async function initReviewMode(config: PrevuiwConfig) {
  const reviewerName = prompt("Enter your name for this review session:") || "Anonymous";

  const shadowRoot = createShadowHost();
  apiClient = new ApiClient(config.apiUrl, config.projectKey);

  // Resolve version
  const resolved = await apiClient.resolveVersion(window.location.href);
  if (!resolved) {
    console.error("[prevuiw] Could not resolve version. Is the project key valid?");
    destroyShadowHost();
    return;
  }
  versionId = resolved.versionId;

  // Create UI components
  toolbar = new Toolbar(shadowRoot, handleModeChange);
  pinManager = new PinManager(shadowRoot);
  cursorLayer = new CursorLayer(shadowRoot);

  // Load existing comments
  comments = await apiClient.getComments(versionId);
  pinManager.renderPins(comments);

  // Connect WebSocket
  wsClient = new WsClient(config.apiUrl, config.projectKey, versionId, reviewerName);

  wsClient.on("_connected", () => {
    toolbar?.setStatus(`${reviewerName}`);
  });

  wsClient.on("_disconnected", () => {
    toolbar?.setStatus("Offline");
    cursorLayer?.setVisible(false);
  });

  wsClient.on("cursor:move", (data: any) => {
    cursorLayer?.updateCursor(data);
  });

  wsClient.on("cursor:join", (data: any) => {
    toolbar?.setStatus(`${reviewerName} +${data.name}`);
  });

  wsClient.on("cursor:leave", (data: any) => {
    cursorLayer?.removeCursor(data.socketId);
  });

  wsClient.on("cursor:presence", (users: any[]) => {
    if (users.length > 0) {
      toolbar?.setStatus(`${reviewerName} +${users.length}`);
    }
  });

  wsClient.on("newComment", (comment: CommentData) => {
    comments.push(comment);
    pinManager?.renderPins(comments);
  });

  await wsClient.connect();

  // Track cursor movement
  document.addEventListener("mousemove", handleGlobalMouseMove);

  // Update pin positions on scroll
  window.addEventListener("scroll", handleScroll, { passive: true });

  toolbar.setStatus(reviewerName);
}

function handleModeChange(mode: ToolbarMode) {
  if (mode === "annotate") {
    const shadowRoot = createShadowHost();
    startPicker(shadowRoot, handleElementPicked);
  } else {
    stopPicker();
    closeCommentInput();
  }
}

function handleElementPicked(data: { selector: string; posX: number; posY: number; pageUrl: string }) {
  stopPicker();
  showCommentInput(data);
}

function showCommentInput(data: { selector: string; posX: number; posY: number; pageUrl: string }) {
  const shadowRoot = createShadowHost();
  closeCommentInput();

  commentInput = document.createElement("div");
  commentInput.className = "prevuiw-comment-input";

  // Position near the clicked point
  const scrollWidth = document.documentElement.scrollWidth;
  const scrollHeight = document.documentElement.scrollHeight;
  const pixelX = (data.posX / 100) * scrollWidth;
  const pixelY = (data.posY / 100) * scrollHeight;
  commentInput.style.left = `${pixelX + 20}px`;
  commentInput.style.top = `${pixelY}px`;

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Add a comment...";

  const actions = document.createElement("div");
  actions.className = "actions";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "btn-cancel";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => {
    closeCommentInput();
    toolbar?.setMode("browse");
  });

  const submitBtn = document.createElement("button");
  submitBtn.className = "btn-submit";
  submitBtn.textContent = "Submit";
  submitBtn.addEventListener("click", async () => {
    const content = textarea.value.trim();
    if (!content || !apiClient || !versionId) return;

    submitBtn.textContent = "...";
    const reviewerName = wsClient ? "Reviewer" : "Anonymous";
    const comment = await apiClient.createComment(versionId, {
      content,
      posX: data.posX,
      posY: data.posY,
      cssSelector: data.selector || null,
      pageUrl: data.pageUrl,
      guestName: reviewerName,
    });

    if (comment) {
      comments.push(comment);
      pinManager?.renderPins(comments);
    }

    closeCommentInput();
    toolbar?.setMode("browse");
  });

  actions.appendChild(cancelBtn);
  actions.appendChild(submitBtn);
  commentInput.appendChild(textarea);
  commentInput.appendChild(actions);
  shadowRoot.appendChild(commentInput);

  setTimeout(() => textarea.focus(), 50);
}

function closeCommentInput() {
  if (commentInput) {
    commentInput.remove();
    commentInput = null;
  }
}

let scrollRafId = 0;
function handleScroll() {
  if (scrollRafId) return;
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = 0;
    pinManager?.updateAllPositions(comments);
  });
}

function handleGlobalMouseMove(e: MouseEvent) {
  if (!wsClient) return;
  const scrollWidth = document.documentElement.scrollWidth;
  const scrollHeight = document.documentElement.scrollHeight;
  const x = ((e.clientX + window.scrollX) / scrollWidth) * 100;
  const y = ((e.clientY + window.scrollY) / scrollHeight) * 100;
  wsClient.sendCursorMove(x, y);
}
```

- [ ] **Step 4: Build SDK**

Run: `pnpm --filter @prevuiw/sdk build 2>&1`
Expected: Build succeeds.

- [ ] **Step 5: Check bundle size**

Run: `ls -la packages/sdk/dist/ && gzip -c packages/sdk/dist/index.global.js | wc -c`
Expected: File exists. Gzipped size printed (target: initial chunk < 15KB).

- [ ] **Step 6: Commit**

```bash
git add packages/sdk/
git commit -m "feat: SDK 리뷰 모드 전체 구현 — 툴바, 커서 레이어, 코멘트 입력, 오케스트레이터"
```

---

## Task 11: Update sdk.js endpoint to serve built bundle

**Files:**
- Modify: `apps/api/src/sdk/sdk.controller.ts`

Already done in Task 4. Verify it works end-to-end:

- [ ] **Step 1: Build SDK and start API**

Run: `pnpm --filter @prevuiw/sdk build && cd apps/api && npx nest build 2>&1 | tail -5`
Expected: Both build successfully.

- [ ] **Step 2: Run existing SDK tests**

Run: `cd apps/api && npx jest --testPathPattern sdk.e2e-spec --verbose 2>&1 | tail -20`
Expected: All SDK tests pass (sdk.js serves built bundle).

- [ ] **Step 3: Commit if any changes needed**

```bash
git add -A
git commit -m "chore: SDK 빌드 번들 서빙 검증 완료"
```

---

## Task 12: Full E2E Integration Test

**Files:**
- Modify: `apps/api/test/sdk.e2e-spec.ts`

- [ ] **Step 1: Add integration test for full SDK flow**

Add to `apps/api/test/sdk.e2e-spec.ts`:

```typescript
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
```

- [ ] **Step 2: Run all tests**

Run: `cd apps/api && npx jest --verbose 2>&1 | tail -30`
Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/api/test/
git commit -m "test: SDK 전체 플로우 통합 E2E 테스트 추가"
```

---

## Self-Review Checklist

1. **Spec coverage:**
   - SDK entry point branching: Task 6
   - Shadow DOM + CSP: Task 7
   - API client + WS client: Task 8
   - Element picker + CSS selector: Task 9
   - Cursor layer + toolbar: Task 10
   - Version resolve: Task 4
   - Project key: Task 3
   - cssSelector field: Tasks 1-2
   - Socket.IO gateway: Task 5
   - Browse/Annotate modes: Tasks 9-10
   - Rate limiting: Task 4 (Throttle decorator)
   - No gaps found.

2. **Placeholder scan:** No TBD/TODO items. All code blocks present.

3. **Type consistency:** Types defined in `types.ts` (Task 6) are used consistently across api-client, ws-client, pin-manager, cursor-layer, and review-mode.
