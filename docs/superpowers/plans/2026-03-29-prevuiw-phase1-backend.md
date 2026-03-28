# prevuiw Phase 1: Backend Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Nest.js API server with Auth, Project/Version management, Comment system (with realtime), and Screenshot capture.

**Architecture:** Monorepo structure with `apps/api` (Nest.js) and `apps/web` (Next.js, Phase 2). Backend uses Nest.js modular architecture with Prisma ORM, Passport for OAuth, Socket.IO gateway for realtime comments, and Playwright for screenshot capture.

**Tech Stack:** Nest.js, PostgreSQL 16, Prisma, Passport (Google/GitHub OAuth), Socket.IO, Playwright, Supabase Storage (screenshots)

---

## File Structure

```
prevuiw/
├── apps/
│   └── api/
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── prisma/
│       │   │   ├── prisma.module.ts
│       │   │   └── prisma.service.ts
│       │   ├── auth/
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── strategies/
│       │   │   │   ├── google.strategy.ts
│       │   │   │   └── github.strategy.ts
│       │   │   ├── guards/
│       │   │   │   ├── jwt-auth.guard.ts
│       │   │   │   └── optional-auth.guard.ts
│       │   │   └── dto/
│       │   │       └── auth.dto.ts
│       │   ├── project/
│       │   │   ├── project.module.ts
│       │   │   ├── project.controller.ts
│       │   │   ├── project.service.ts
│       │   │   └── dto/
│       │   │       └── project.dto.ts
│       │   ├── version/
│       │   │   ├── version.module.ts
│       │   │   ├── version.controller.ts
│       │   │   ├── version.service.ts
│       │   │   └── dto/
│       │   │       └── version.dto.ts
│       │   ├── comment/
│       │   │   ├── comment.module.ts
│       │   │   ├── comment.controller.ts
│       │   │   ├── comment.service.ts
│       │   │   ├── comment.gateway.ts
│       │   │   └── dto/
│       │   │       └── comment.dto.ts
│       │   ├── reaction/
│       │   │   ├── reaction.module.ts
│       │   │   ├── reaction.controller.ts
│       │   │   └── reaction.service.ts
│       │   ├── screenshot/
│       │   │   ├── screenshot.module.ts
│       │   │   ├── screenshot.service.ts
│       │   │   └── screenshot.processor.ts
│       │   ├── notification/
│       │   │   ├── notification.module.ts
│       │   │   ├── notification.controller.ts
│       │   │   ├── notification.service.ts
│       │   │   └── notification.gateway.ts
│       │   └── common/
│       │       ├── decorators/
│       │       │   └── current-user.decorator.ts
│       │       └── filters/
│       │           └── ws-exception.filter.ts
│       ├── prisma/
│       │   └── schema.prisma
│       ├── test/
│       │   ├── jest-e2e.json
│       │   ├── auth.e2e-spec.ts
│       │   ├── project.e2e-spec.ts
│       │   ├── version.e2e-spec.ts
│       │   ├── comment.e2e-spec.ts
│       │   └── setup.ts
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.build.json
│       ├── nest-cli.json
│       └── .env.example
├── package.json          # Root workspace
├── pnpm-workspace.yaml
├── .gitignore
└── .env.example
```

---

### Task 1: Monorepo & Nest.js Scaffolding

**Files:**
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/tsconfig.build.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/.env.example`

- [ ] **Step 1: Create root workspace files**

```json
// package.json
{
  "name": "prevuiw",
  "private": true,
  "scripts": {
    "dev:api": "pnpm --filter @prevuiw/api dev",
    "build:api": "pnpm --filter @prevuiw/api build",
    "test:api": "pnpm --filter @prevuiw/api test",
    "test:api:e2e": "pnpm --filter @prevuiw/api test:e2e",
    "db:migrate": "pnpm --filter @prevuiw/api db:migrate",
    "db:generate": "pnpm --filter @prevuiw/api db:generate",
    "db:push": "pnpm --filter @prevuiw/api db:push",
    "db:studio": "pnpm --filter @prevuiw/api db:studio"
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
```

```gitignore
# .gitignore
node_modules/
dist/
.env
.env.production
.env.local
*.log
.DS_Store
.superpowers/
```

- [ ] **Step 2: Create Nest.js app package**

```json
// apps/api/package.json
{
  "name": "@prevuiw/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "start:prod": "node dist/main",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/config": "^4.0.0",
    "@nestjs/passport": "^11.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/platform-socket.io": "^11.0.0",
    "@nestjs/websockets": "^11.0.0",
    "@prisma/client": "^6.0.0",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-github2": "^0.1.12",
    "passport-jwt": "^4.0.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0",
    "@supabase/supabase-js": "^2.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/jest": "^29.0.0",
    "@types/node": "^22.0.0",
    "@types/passport-google-oauth20": "^2.0.0",
    "@types/passport-github2": "^1.2.0",
    "@types/passport-jwt": "^4.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "prisma": "^6.0.0",
    "typescript": "^5.7.0",
    "ts-node": "^10.9.0"
  }
}
```

- [ ] **Step 3: Create TypeScript and Nest configs**

```json
// apps/api/tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2022",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

```json
// apps/api/tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

```json
// apps/api/nest-cli.json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

- [ ] **Step 4: Create main.ts and app.module.ts**

```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.API_PORT || 3012;
  await app.listen(port);
  console.log(`prevuiw API running on port ${port}`);
}
bootstrap();
```

```typescript
// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 5: Create .env.example**

```env
# apps/api/.env.example
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prevuiw?schema=public"
JWT_SECRET="dev-secret-change-in-production"
JWT_EXPIRATION="7d"
API_PORT=3012
FRONTEND_URL="http://localhost:3000"

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL="http://localhost:3012/auth/google/callback"
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL="http://localhost:3012/auth/github/callback"

# Supabase (screenshots storage)
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

- [ ] **Step 6: Install dependencies and verify**

Run: `pnpm install`
Run: `cd apps/api && cp .env.example .env`

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: 모노레포 구조 및 Nest.js 스캐폴딩 초기화"
```

---

### Task 2: Prisma Schema & Database Setup

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Create: `apps/api/src/prisma/prisma.service.ts`

- [ ] **Step 1: Write Prisma schema**

```prisma
// apps/api/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum AuthProvider {
  GOOGLE
  GITHUB
}

enum UrlType {
  IMMUTABLE
  MUTABLE
}

enum Viewport {
  MOBILE_375
  TABLET_768
  LAPTOP_1440
  DESKTOP_1920
}

enum NotificationType {
  MENTION
  REPLY
  RESOLVE
}

model User {
  id         String       @id @default(uuid()) @db.Uuid
  email      String       @unique
  name       String
  avatarUrl  String?
  provider   AuthProvider
  providerId String
  createdAt  DateTime     @default(now())

  projects      Project[]
  comments      Comment[]
  reactions     Reaction[]
  notifications Notification[]

  @@unique([provider, providerId])
  @@map("users")
}

model Project {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  slug      String   @unique
  ownerId   String   @db.Uuid
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  owner    User      @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  versions Version[]

  @@map("projects")
}

model Version {
  id          String   @id @default(uuid()) @db.Uuid
  projectId   String   @db.Uuid
  versionName String
  url         String
  memo        String?
  urlType     UrlType
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  comments    Comment[]
  screenshots Screenshot[]

  @@map("versions")
}

model Comment {
  id            String   @id @default(uuid()) @db.Uuid
  versionId     String   @db.Uuid
  authorId      String?  @db.Uuid
  guestName     String?
  content       String
  posX          Float
  posY          Float
  selectionArea Json?
  parentId      String?  @db.Uuid
  isResolved    Boolean  @default(false)
  createdAt     DateTime @default(now())

  version  Version   @relation(fields: [versionId], references: [id], onDelete: Cascade)
  author   User?     @relation(fields: [authorId], references: [id], onDelete: SetNull)
  parent   Comment?  @relation("CommentThread", fields: [parentId], references: [id], onDelete: Cascade)
  replies  Comment[] @relation("CommentThread")

  reactions     Reaction[]
  notifications Notification[]

  @@map("comments")
}

model Reaction {
  id        String @id @default(uuid()) @db.Uuid
  commentId String @db.Uuid
  userId    String @db.Uuid
  emoji     String

  comment Comment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([commentId, userId, emoji])
  @@map("reactions")
}

model Screenshot {
  id         String   @id @default(uuid()) @db.Uuid
  versionId  String   @db.Uuid
  viewport   Viewport
  imageUrl   String
  capturedAt DateTime @default(now())

  version Version @relation(fields: [versionId], references: [id], onDelete: Cascade)

  @@map("screenshots")
}

model Notification {
  id        String           @id @default(uuid()) @db.Uuid
  userId    String           @db.Uuid
  commentId String           @db.Uuid
  type      NotificationType
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  comment Comment @relation(fields: [commentId], references: [id], onDelete: Cascade)

  @@map("notifications")
}
```

- [ ] **Step 2: Create PrismaService**

```typescript
// apps/api/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```typescript
// apps/api/src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 3: Generate Prisma client and run migration**

Run: `cd apps/api && npx prisma generate`
Run: `cd apps/api && npx prisma migrate dev --name init`
Expected: Migration applied, Prisma client generated

- [ ] **Step 4: Verify with Prisma Studio**

Run: `cd apps/api && npx prisma studio`
Expected: Browser opens with all 7 tables visible (users, projects, versions, comments, reactions, screenshots, notifications)

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: Prisma 스키마 및 DB 마이그레이션 설정"
```

---

### Task 3: Auth Module (JWT + Google + GitHub OAuth)

**Files:**
- Create: `apps/api/src/auth/auth.module.ts`
- Create: `apps/api/src/auth/auth.controller.ts`
- Create: `apps/api/src/auth/auth.service.ts`
- Create: `apps/api/src/auth/strategies/google.strategy.ts`
- Create: `apps/api/src/auth/strategies/github.strategy.ts`
- Create: `apps/api/src/auth/guards/jwt-auth.guard.ts`
- Create: `apps/api/src/auth/guards/optional-auth.guard.ts`
- Create: `apps/api/src/auth/dto/auth.dto.ts`
- Create: `apps/api/src/common/decorators/current-user.decorator.ts`
- Modify: `apps/api/src/app.module.ts`
- Create: `apps/api/test/auth.e2e-spec.ts`
- Create: `apps/api/test/setup.ts`
- Create: `apps/api/test/jest-e2e.json`

- [ ] **Step 1: Write e2e test setup and auth test**

```typescript
// apps/api/test/jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/../src/$1"
  },
  "setupFilesAfterSetup": ["./setup.ts"]
}
```

```typescript
// apps/api/test/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.notification.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.screenshot.deleteMany();
  await prisma.version.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

```typescript
// apps/api/test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.notification.deleteMany();
    await prisma.reaction.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.screenshot.deleteMany();
    await prisma.version.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /auth/google', () => {
    it('should redirect to Google OAuth', () => {
      return request(app.getHttpServer())
        .get('/auth/google')
        .expect(302)
        .expect('Location', /accounts\.google\.com/);
    });
  });

  describe('GET /auth/github', () => {
    it('should redirect to GitHub OAuth', () => {
      return request(app.getHttpServer())
        .get('/auth/github')
        .expect(302)
        .expect('Location', /github\.com\/login\/oauth/);
    });
  });

  describe('GET /auth/me', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/api && pnpm test:e2e`
Expected: FAIL — AppModule doesn't have auth routes

- [ ] **Step 3: Create auth DTOs**

```typescript
// apps/api/src/auth/dto/auth.dto.ts
export class OAuthUserDto {
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'GOOGLE' | 'GITHUB';
  providerId: string;
}

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
}
```

- [ ] **Step 4: Create CurrentUser decorator**

```typescript
// apps/api/src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

- [ ] **Step 5: Create AuthService**

```typescript
// apps/api/src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { OAuthUserDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateOAuthUser(dto: OAuthUserDto): Promise<AuthResponseDto> {
    let user = await this.prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: dto.provider,
          providerId: dto.providerId,
        },
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          avatarUrl: dto.avatarUrl,
          provider: dto.provider,
          providerId: dto.providerId,
        },
      });
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

- [ ] **Step 6: Create OAuth strategies**

```typescript
// apps/api/src/auth/strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get('GOOGLE_CLIENT_ID'),
      clientSecret: config.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    done(null, {
      email: profile.emails[0].value,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
      provider: 'GOOGLE' as const,
      providerId: profile.id,
    });
  }
}
```

```typescript
// apps/api/src/auth/strategies/github.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get('GITHUB_CLIENT_ID'),
      clientSecret: config.get('GITHUB_CLIENT_SECRET'),
      callbackURL: config.get('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return {
      email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
      name: profile.displayName || profile.username,
      avatarUrl: profile.photos?.[0]?.value,
      provider: 'GITHUB' as const,
      providerId: profile.id,
    };
  }
}
```

- [ ] **Step 7: Create JWT guard and Optional auth guard**

```typescript
// apps/api/src/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
```

```typescript
// apps/api/src/auth/guards/optional-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    return user || null;
  }
}
```

- [ ] **Step 8: Create JWT strategy**

```typescript
// apps/api/src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    return this.authService.getUserById(payload.sub);
  }
}
```

- [ ] **Step 9: Create AuthController**

```typescript
// apps/api/src/auth/auth.controller.ts
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.validateOAuthUser(req.user);
    const frontendUrl = this.config.get('FRONTEND_URL');
    res.redirect(
      `${frontendUrl}/auth/callback?token=${result.accessToken}`,
    );
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.validateOAuthUser(req.user);
    const frontendUrl = this.config.get('FRONTEND_URL');
    res.redirect(
      `${frontendUrl}/auth/callback?token=${result.accessToken}`,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };
  }
}
```

- [ ] **Step 10: Create AuthModule and register in AppModule**

```typescript
// apps/api/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRATION', '7d') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, GithubStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

Update `apps/api/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 11: Run tests**

Run: `cd apps/api && pnpm test:e2e`
Expected: Auth e2e tests pass (Google/GitHub redirect, /auth/me 401)

- [ ] **Step 12: Commit**

```bash
git add .
git commit -m "feat: Auth 모듈 구현 (Google/GitHub OAuth, JWT)"
```

---

### Task 4: Project Module (CRUD)

**Files:**
- Create: `apps/api/src/project/project.module.ts`
- Create: `apps/api/src/project/project.controller.ts`
- Create: `apps/api/src/project/project.service.ts`
- Create: `apps/api/src/project/dto/project.dto.ts`
- Create: `apps/api/test/project.e2e-spec.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write project e2e test**

```typescript
// apps/api/test/project.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Project (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
  });

  beforeEach(async () => {
    await prisma.notification.deleteMany();
    await prisma.reaction.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.screenshot.deleteMany();
    await prisma.version.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        name: 'Test User',
        provider: 'GOOGLE',
        providerId: 'google-123',
      },
    });
    userId = user.id;
    authToken = jwtService.sign({ sub: user.id, email: user.email });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /projects', () => {
    it('should create a project', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'My App' })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('My App');
          expect(res.body.slug).toBeDefined();
          expect(res.body.ownerId).toBe(userId);
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .send({ name: 'My App' })
        .expect(401);
    });
  });

  describe('GET /projects', () => {
    it('should list user projects', async () => {
      await prisma.project.create({
        data: { name: 'Project 1', slug: 'project-1', ownerId: userId },
      });

      return request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].name).toBe('Project 1');
        });
    });
  });

  describe('GET /projects/:slug', () => {
    it('should get project by slug (no auth required)', async () => {
      await prisma.project.create({
        data: { name: 'Public Project', slug: 'public-proj', ownerId: userId },
      });

      return request(app.getHttpServer())
        .get('/projects/public-proj')
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Public Project');
        });
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/api && pnpm test:e2e -- --testPathPattern=project`
Expected: FAIL

- [ ] **Step 3: Create project DTOs**

```typescript
// apps/api/src/project/dto/project.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;
}
```

- [ ] **Step 4: Create ProjectService**

```typescript
// apps/api/src/project/project.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const suffix = randomBytes(3).toString('hex');
    return `${base}-${suffix}`;
  }

  async create(userId: string, dto: CreateProjectDto) {
    const slug = this.generateSlug(dto.name);
    return this.prisma.project.create({
      data: {
        name: dto.name,
        slug,
        ownerId: userId,
      },
      include: { _count: { select: { versions: true } } },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        _count: { select: { versions: true } },
        versions: {
          where: { isActive: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { comments: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        versions: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { comments: true } },
            screenshots: true,
          },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(slug: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { slug } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== userId) throw new ForbiddenException();

    return this.prisma.project.update({
      where: { slug },
      data: dto,
    });
  }

  async delete(slug: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { slug } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== userId) throw new ForbiddenException();

    return this.prisma.project.delete({ where: { slug } });
  }
}
```

- [ ] **Step 5: Create ProjectController**

```typescript
// apps/api/src/project/project.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('projects')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() dto: CreateProjectDto) {
    return this.projectService.create(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: any) {
    return this.projectService.findAllByUser(user.id);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.projectService.findBySlug(slug);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('slug') slug: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.update(slug, user.id, dto);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  delete(@Param('slug') slug: string, @CurrentUser() user: any) {
    return this.projectService.delete(slug, user.id);
  }
}
```

- [ ] **Step 6: Create ProjectModule and register**

```typescript
// apps/api/src/project/project.module.ts
import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
```

Add `ProjectModule` to `AppModule` imports.

- [ ] **Step 7: Run tests**

Run: `cd apps/api && pnpm test:e2e -- --testPathPattern=project`
Expected: All project e2e tests pass

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: Project 모듈 CRUD 구현"
```

---

### Task 5: Version Module (CRUD + URL Type Detection)

**Files:**
- Create: `apps/api/src/version/version.module.ts`
- Create: `apps/api/src/version/version.controller.ts`
- Create: `apps/api/src/version/version.service.ts`
- Create: `apps/api/src/version/dto/version.dto.ts`
- Create: `apps/api/test/version.e2e-spec.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write version e2e test**

```typescript
// apps/api/test/version.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Version (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let projectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
  });

  beforeEach(async () => {
    await prisma.notification.deleteMany();
    await prisma.reaction.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.screenshot.deleteMany();
    await prisma.version.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        name: 'Test User',
        provider: 'GOOGLE',
        providerId: 'google-123',
      },
    });
    authToken = jwtService.sign({ sub: user.id, email: user.email });

    const project = await prisma.project.create({
      data: { name: 'Test Project', slug: 'test-proj', ownerId: user.id },
    });
    projectId = project.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /projects/:projectId/versions', () => {
    it('should create a version with immutable URL detection', () => {
      return request(app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          versionName: 'v1.0',
          url: 'https://my-app-abc123.vercel.app',
          memo: 'Initial release',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.versionName).toBe('v1.0');
          expect(res.body.urlType).toBe('IMMUTABLE');
          expect(res.body.isActive).toBe(true);
        });
    });

    it('should detect mutable URL', () => {
      return request(app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          versionName: 'v1.0',
          url: 'https://example.com',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.urlType).toBe('MUTABLE');
        });
    });

    it('should deactivate previous active version', async () => {
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ versionName: 'v1.0', url: 'https://v1.vercel.app' });

      await request(app.getHttpServer())
        .post(`/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ versionName: 'v2.0', url: 'https://v2.vercel.app' });

      const versions = await prisma.version.findMany({
        where: { projectId },
        orderBy: { createdAt: 'asc' },
      });

      expect(versions[0].isActive).toBe(false);
      expect(versions[1].isActive).toBe(true);
    });
  });

  describe('GET /projects/:projectId/versions', () => {
    it('should list versions ordered by createdAt desc', async () => {
      await prisma.version.createMany({
        data: [
          { projectId, versionName: 'v1.0', url: 'https://v1.app', urlType: 'IMMUTABLE', isActive: false },
          { projectId, versionName: 'v2.0', url: 'https://v2.app', urlType: 'IMMUTABLE', isActive: true },
        ],
      });

      return request(app.getHttpServer())
        .get(`/projects/${projectId}/versions`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0].versionName).toBe('v2.0');
        });
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/api && pnpm test:e2e -- --testPathPattern=version`
Expected: FAIL

- [ ] **Step 3: Create version DTOs**

```typescript
// apps/api/src/version/dto/version.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateVersionDto {
  @IsString()
  @IsNotEmpty()
  versionName: string;

  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  memo?: string;
}
```

- [ ] **Step 4: Create VersionService with URL type detection**

```typescript
// apps/api/src/version/version.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UrlType } from '@prisma/client';
import { CreateVersionDto } from './dto/version.dto';

const IMMUTABLE_PATTERNS = [
  /^https:\/\/[\w-]+-[\w]{6,}\.vercel\.app/,       // Vercel deploy URLs
  /^https:\/\/[\w]+-{2}[\w-]+\.netlify\.app/,       // Netlify deploy URLs
  /^https:\/\/[\w]+\.[\w-]+\.pages\.dev/,            // Cloudflare Pages
  /^https:\/\/pr-\d+\.[\w-]+\.amplifyapp\.com/,     // AWS Amplify
  /^https:\/\/[\w-]+-pr-\d+\.onrender\.com/,        // Render
];

@Injectable()
export class VersionService {
  constructor(private prisma: PrismaService) {}

  detectUrlType(url: string): UrlType {
    return IMMUTABLE_PATTERNS.some((pattern) => pattern.test(url))
      ? UrlType.IMMUTABLE
      : UrlType.MUTABLE;
  }

  async create(projectId: string, userId: string, dto: CreateVersionDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== userId) throw new ForbiddenException();

    const urlType = this.detectUrlType(dto.url);

    // Deactivate previous active version
    await this.prisma.version.updateMany({
      where: { projectId, isActive: true },
      data: { isActive: false },
    });

    return this.prisma.version.create({
      data: {
        projectId,
        versionName: dto.versionName,
        url: dto.url,
        memo: dto.memo,
        urlType,
        isActive: true,
      },
    });
  }

  async findAllByProject(projectId: string) {
    return this.prisma.version.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { comments: true } },
        screenshots: true,
      },
    });
  }

  async findById(id: string) {
    const version = await this.prisma.version.findUnique({
      where: { id },
      include: {
        project: { select: { slug: true, name: true, ownerId: true } },
        screenshots: true,
        _count: { select: { comments: true } },
      },
    });
    if (!version) throw new NotFoundException('Version not found');
    return version;
  }
}
```

- [ ] **Step 5: Create VersionController**

```typescript
// apps/api/src/version/version.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { VersionService } from './version.service';
import { CreateVersionDto } from './dto/version.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('projects/:projectId/versions')
export class VersionController {
  constructor(private versionService: VersionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateVersionDto,
  ) {
    return this.versionService.create(projectId, user.id, dto);
  }

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.versionService.findAllByProject(projectId);
  }

  @Get(':versionId')
  findOne(@Param('versionId') versionId: string) {
    return this.versionService.findById(versionId);
  }
}
```

- [ ] **Step 6: Create VersionModule and register**

```typescript
// apps/api/src/version/version.module.ts
import { Module } from '@nestjs/common';
import { VersionController } from './version.controller';
import { VersionService } from './version.service';

@Module({
  controllers: [VersionController],
  providers: [VersionService],
  exports: [VersionService],
})
export class VersionModule {}
```

Add `VersionModule` to `AppModule` imports.

- [ ] **Step 7: Run tests**

Run: `cd apps/api && pnpm test:e2e -- --testPathPattern=version`
Expected: All version e2e tests pass

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: Version 모듈 구현 (CRUD, URL 타입 자동 감지)"
```

---

### Task 6: Comment Module (CRUD + WebSocket Realtime)

**Files:**
- Create: `apps/api/src/comment/comment.module.ts`
- Create: `apps/api/src/comment/comment.controller.ts`
- Create: `apps/api/src/comment/comment.service.ts`
- Create: `apps/api/src/comment/comment.gateway.ts`
- Create: `apps/api/src/comment/dto/comment.dto.ts`
- Create: `apps/api/src/common/filters/ws-exception.filter.ts`
- Create: `apps/api/test/comment.e2e-spec.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write comment e2e test**

```typescript
// apps/api/test/comment.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Comment (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let versionId: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
  });

  beforeEach(async () => {
    await prisma.notification.deleteMany();
    await prisma.reaction.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.screenshot.deleteMany();
    await prisma.version.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        name: 'Test User',
        provider: 'GOOGLE',
        providerId: 'google-123',
      },
    });
    userId = user.id;
    authToken = jwtService.sign({ sub: user.id, email: user.email });

    const project = await prisma.project.create({
      data: { name: 'Test', slug: 'test', ownerId: user.id },
    });
    const version = await prisma.version.create({
      data: {
        projectId: project.id,
        versionName: 'v1.0',
        url: 'https://test.vercel.app',
        urlType: 'IMMUTABLE',
      },
    });
    versionId = version.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /versions/:versionId/comments', () => {
    it('should create a comment (authenticated user)', () => {
      return request(app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Button is too small',
          posX: 25.5,
          posY: 60.3,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.content).toBe('Button is too small');
          expect(res.body.authorId).toBe(userId);
          expect(res.body.posX).toBe(25.5);
        });
    });

    it('should create a comment (guest with nickname)', () => {
      return request(app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .send({
          content: 'Font too small',
          posX: 10,
          posY: 20,
          guestName: 'Designer Kim',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.guestName).toBe('Designer Kim');
          expect(res.body.authorId).toBeNull();
        });
    });

    it('should create a comment with selection area (drag)', () => {
      return request(app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This section needs work',
          posX: 30,
          posY: 40,
          selectionArea: { x: 30, y: 40, width: 20, height: 15 },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.selectionArea).toEqual({ x: 30, y: 40, width: 20, height: 15 });
        });
    });

    it('should create a reply (thread)', async () => {
      const parent = await prisma.comment.create({
        data: {
          versionId,
          authorId: userId,
          content: 'Parent comment',
          posX: 10,
          posY: 20,
        },
      });

      return request(app.getHttpServer())
        .post(`/versions/${versionId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Reply to parent',
          posX: 10,
          posY: 20,
          parentId: parent.id,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.parentId).toBe(parent.id);
        });
    });
  });

  describe('PATCH /versions/:versionId/comments/:id/resolve', () => {
    it('should resolve a comment', async () => {
      const comment = await prisma.comment.create({
        data: {
          versionId,
          authorId: userId,
          content: 'Fix spacing',
          posX: 10,
          posY: 20,
        },
      });

      return request(app.getHttpServer())
        .patch(`/versions/${versionId}/comments/${comment.id}/resolve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.isResolved).toBe(true);
        });
    });
  });

  describe('GET /versions/:versionId/comments', () => {
    it('should list comments for a version', async () => {
      await prisma.comment.create({
        data: {
          versionId,
          authorId: userId,
          content: 'Comment 1',
          posX: 10,
          posY: 20,
        },
      });

      return request(app.getHttpServer())
        .get(`/versions/${versionId}/comments`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].author).toBeDefined();
        });
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/api && pnpm test:e2e -- --testPathPattern=comment`
Expected: FAIL

- [ ] **Step 3: Create comment DTOs**

```typescript
// apps/api/src/comment/dto/comment.dto.ts
import {
  IsString, IsNotEmpty, IsNumber, IsOptional,
  IsUUID, IsObject, ValidateIf,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  posX: number;

  @IsNumber()
  posY: number;

  @IsObject()
  @IsOptional()
  selectionArea?: { x: number; y: number; width: number; height: number };

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ValidateIf((o) => !o.authorId)
  @IsString()
  @IsOptional()
  guestName?: string;
}
```

- [ ] **Step 4: Create CommentService**

```typescript
// apps/api/src/comment/comment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(versionId: string, userId: string | null, dto: CreateCommentDto) {
    const version = await this.prisma.version.findUnique({ where: { id: versionId } });
    if (!version) throw new NotFoundException('Version not found');

    return this.prisma.comment.create({
      data: {
        versionId,
        authorId: userId,
        guestName: userId ? null : dto.guestName,
        content: dto.content,
        posX: dto.posX,
        posY: dto.posY,
        selectionArea: dto.selectionArea ?? undefined,
        parentId: dto.parentId,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async findAllByVersion(versionId: string) {
    return this.prisma.comment.findMany({
      where: { versionId, parentId: null },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        replies: {
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
            reactions: { include: { user: { select: { id: true, name: true } } } },
          },
          orderBy: { createdAt: 'asc' },
        },
        reactions: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolve(commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { isResolved: !comment.isResolved },
    });
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new NotFoundException();

    return this.prisma.comment.delete({ where: { id: commentId } });
  }
}
```

- [ ] **Step 5: Create CommentController**

```typescript
// apps/api/src/comment/comment.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Req,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/comment.dto';
import { OptionalAuthGuard } from '@/auth/guards/optional-auth.guard';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('versions/:versionId/comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  create(
    @Param('versionId') versionId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.create(versionId, user?.id ?? null, dto);
  }

  @Get()
  findAll(@Param('versionId') versionId: string) {
    return this.commentService.findAllByVersion(versionId);
  }

  @Patch(':id/resolve')
  @UseGuards(JwtAuthGuard)
  resolve(@Param('id') id: string) {
    return this.commentService.resolve(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.commentService.delete(id, user.id);
  }
}
```

- [ ] **Step 6: Create WebSocket gateway for realtime comments**

```typescript
// apps/api/src/common/filters/ws-exception.filter.ts
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    client.emit('error', { message: exception.message });
  }
}
```

```typescript
// apps/api/src/comment/comment.gateway.ts
import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect,
  ConnectedSocket, MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseFilters } from '@nestjs/common';
import { WsExceptionFilter } from '@/common/filters/ws-exception.filter';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
  namespace: '/comments',
})
@UseFilters(WsExceptionFilter)
export class CommentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private versionUsers = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    const versionId = client.handshake.query.versionId as string;
    if (versionId) {
      client.join(`version:${versionId}`);
      if (!this.versionUsers.has(versionId)) {
        this.versionUsers.set(versionId, new Set());
      }
      this.versionUsers.get(versionId).add(client.id);
      this.broadcastOnlineCount(versionId);
    }
  }

  handleDisconnect(client: Socket) {
    const versionId = client.handshake.query.versionId as string;
    if (versionId && this.versionUsers.has(versionId)) {
      this.versionUsers.get(versionId).delete(client.id);
      this.broadcastOnlineCount(versionId);
    }
  }

  private broadcastOnlineCount(versionId: string) {
    const count = this.versionUsers.get(versionId)?.size || 0;
    this.server.to(`version:${versionId}`).emit('onlineCount', count);
  }

  emitNewComment(versionId: string, comment: any) {
    this.server.to(`version:${versionId}`).emit('newComment', comment);
  }

  emitResolveComment(versionId: string, commentId: string, isResolved: boolean) {
    this.server.to(`version:${versionId}`).emit('resolveComment', { commentId, isResolved });
  }

  emitDeleteComment(versionId: string, commentId: string) {
    this.server.to(`version:${versionId}`).emit('deleteComment', { commentId });
  }
}
```

- [ ] **Step 7: Update CommentController to emit WebSocket events**

Update the controller's `create`, `resolve`, and `delete` methods to inject `CommentGateway` and call emit methods after each operation:

```typescript
// apps/api/src/comment/comment.controller.ts — updated
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentGateway } from './comment.gateway';
import { CreateCommentDto } from './dto/comment.dto';
import { OptionalAuthGuard } from '@/auth/guards/optional-auth.guard';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('versions/:versionId/comments')
export class CommentController {
  constructor(
    private commentService: CommentService,
    private commentGateway: CommentGateway,
  ) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  async create(
    @Param('versionId') versionId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.commentService.create(versionId, user?.id ?? null, dto);
    this.commentGateway.emitNewComment(versionId, comment);
    return comment;
  }

  @Get()
  findAll(@Param('versionId') versionId: string) {
    return this.commentService.findAllByVersion(versionId);
  }

  @Patch(':id/resolve')
  @UseGuards(JwtAuthGuard)
  async resolve(@Param('versionId') versionId: string, @Param('id') id: string) {
    const comment = await this.commentService.resolve(id);
    this.commentGateway.emitResolveComment(versionId, id, comment.isResolved);
    return comment;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('versionId') versionId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.commentService.delete(id, user.id);
    this.commentGateway.emitDeleteComment(versionId, id);
    return result;
  }
}
```

- [ ] **Step 8: Create CommentModule and register**

```typescript
// apps/api/src/comment/comment.module.ts
import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentGateway } from './comment.gateway';

@Module({
  controllers: [CommentController],
  providers: [CommentService, CommentGateway],
  exports: [CommentService, CommentGateway],
})
export class CommentModule {}
```

Add `CommentModule` to `AppModule` imports.

- [ ] **Step 9: Run tests**

Run: `cd apps/api && pnpm test:e2e -- --testPathPattern=comment`
Expected: All comment e2e tests pass

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: Comment 모듈 구현 (CRUD, 스레드, Resolve, WebSocket 실시간 동기화)"
```

---

### Task 7: Reaction Module

**Files:**
- Create: `apps/api/src/reaction/reaction.module.ts`
- Create: `apps/api/src/reaction/reaction.controller.ts`
- Create: `apps/api/src/reaction/reaction.service.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create ReactionService**

```typescript
// apps/api/src/reaction/reaction.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ReactionService {
  constructor(private prisma: PrismaService) {}

  async toggle(commentId: string, userId: string, emoji: string) {
    const existing = await this.prisma.reaction.findUnique({
      where: { commentId_userId_emoji: { commentId, userId, emoji } },
    });

    if (existing) {
      await this.prisma.reaction.delete({ where: { id: existing.id } });
      return { action: 'removed' };
    }

    const reaction = await this.prisma.reaction.create({
      data: { commentId, userId, emoji },
      include: { user: { select: { id: true, name: true } } },
    });
    return { action: 'added', reaction };
  }
}
```

- [ ] **Step 2: Create ReactionController**

```typescript
// apps/api/src/reaction/reaction.controller.ts
import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { IsString, IsNotEmpty } from 'class-validator';

class ToggleReactionDto {
  @IsString()
  @IsNotEmpty()
  emoji: string;
}

@Controller('comments/:commentId/reactions')
export class ReactionController {
  constructor(private reactionService: ReactionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  toggle(
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
    @Body() dto: ToggleReactionDto,
  ) {
    return this.reactionService.toggle(commentId, user.id, dto.emoji);
  }
}
```

- [ ] **Step 3: Create ReactionModule and register**

```typescript
// apps/api/src/reaction/reaction.module.ts
import { Module } from '@nestjs/common';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';

@Module({
  controllers: [ReactionController],
  providers: [ReactionService],
})
export class ReactionModule {}
```

Add `ReactionModule` to `AppModule` imports.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: Reaction 모듈 구현 (이모지 토글)"
```

---

### Task 8: Screenshot Module (Playwright + Supabase Storage)

**Files:**
- Create: `apps/api/src/screenshot/screenshot.module.ts`
- Create: `apps/api/src/screenshot/screenshot.service.ts`
- Create: `apps/api/src/screenshot/screenshot.processor.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/package.json` (add playwright)

- [ ] **Step 1: Install Playwright**

Run: `cd apps/api && pnpm add playwright @supabase/supabase-js`

- [ ] **Step 2: Create ScreenshotProcessor (Playwright capture)**

```typescript
// apps/api/src/screenshot/screenshot.processor.ts
import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser } from 'playwright';

const VIEWPORTS = [
  { name: 'MOBILE_375', width: 375, height: 812 },
  { name: 'TABLET_768', width: 768, height: 1024 },
  { name: 'LAPTOP_1440', width: 1440, height: 900 },
  { name: 'DESKTOP_1920', width: 1920, height: 1080 },
] as const;

@Injectable()
export class ScreenshotProcessor {
  private readonly logger = new Logger(ScreenshotProcessor.name);

  async captureAll(url: string): Promise<Array<{ viewport: string; buffer: Buffer }>> {
    let browser: Browser | null = null;
    const results: Array<{ viewport: string; buffer: Buffer }> = [];

    try {
      browser = await chromium.launch({ headless: true });

      for (const vp of VIEWPORTS) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
        });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const buffer = await page.screenshot({ fullPage: true });
        results.push({ viewport: vp.name, buffer: Buffer.from(buffer) });
        await context.close();
      }
    } catch (error) {
      this.logger.error(`Screenshot capture failed for ${url}:`, error);
      throw error;
    } finally {
      if (browser) await browser.close();
    }

    return results;
  }
}
```

- [ ] **Step 3: Create ScreenshotService (Supabase upload)**

```typescript
// apps/api/src/screenshot/screenshot.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { ScreenshotProcessor } from './screenshot.processor';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Viewport } from '@prisma/client';

@Injectable()
export class ScreenshotService {
  private readonly logger = new Logger(ScreenshotService.name);
  private supabase: SupabaseClient;

  constructor(
    private prisma: PrismaService,
    private processor: ScreenshotProcessor,
    private config: ConfigService,
  ) {
    const url = this.config.get('SUPABASE_URL');
    const key = this.config.get('SUPABASE_SERVICE_KEY');
    if (url && key) {
      this.supabase = createClient(url, key);
    }
  }

  async captureAndStore(versionId: string, url: string) {
    if (!this.supabase) {
      this.logger.warn('Supabase not configured, skipping screenshot capture');
      return [];
    }

    const captures = await this.processor.captureAll(url);
    const screenshots = [];

    for (const cap of captures) {
      const filePath = `screenshots/${versionId}/${cap.viewport}.png`;

      const { error } = await this.supabase.storage
        .from('prevuiw')
        .upload(filePath, cap.buffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (error) {
        this.logger.error(`Upload failed for ${cap.viewport}:`, error);
        continue;
      }

      const { data: urlData } = this.supabase.storage
        .from('prevuiw')
        .getPublicUrl(filePath);

      const screenshot = await this.prisma.screenshot.create({
        data: {
          versionId,
          viewport: cap.viewport as Viewport,
          imageUrl: urlData.publicUrl,
        },
      });
      screenshots.push(screenshot);
    }

    return screenshots;
  }
}
```

- [ ] **Step 4: Create ScreenshotModule and register**

```typescript
// apps/api/src/screenshot/screenshot.module.ts
import { Module } from '@nestjs/common';
import { ScreenshotService } from './screenshot.service';
import { ScreenshotProcessor } from './screenshot.processor';

@Module({
  providers: [ScreenshotService, ScreenshotProcessor],
  exports: [ScreenshotService],
})
export class ScreenshotModule {}
```

Add `ScreenshotModule` to `AppModule` imports.

- [ ] **Step 5: Integrate with VersionService — trigger capture on mutable URL version deactivation**

Add to `VersionService.create()` — after deactivating old version, if the old version was MUTABLE, trigger screenshot capture:

```typescript
// Update apps/api/src/version/version.service.ts — inject ScreenshotService
import { ScreenshotService } from '@/screenshot/screenshot.service';

// In constructor:
constructor(
  private prisma: PrismaService,
  private screenshotService: ScreenshotService,
) {}

// In create() method, after deactivating previous version:
async create(projectId: string, userId: string, dto: CreateVersionDto) {
  const project = await this.prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundException('Project not found');
  if (project.ownerId !== userId) throw new ForbiddenException();

  const urlType = this.detectUrlType(dto.url);

  // Find and deactivate previous active version
  const previousActive = await this.prisma.version.findFirst({
    where: { projectId, isActive: true },
  });

  if (previousActive) {
    await this.prisma.version.update({
      where: { id: previousActive.id },
      data: { isActive: false },
    });

    // Capture screenshots for mutable URLs before they change
    if (previousActive.urlType === 'MUTABLE') {
      this.screenshotService
        .captureAndStore(previousActive.id, previousActive.url)
        .catch((err) => console.error('Screenshot capture failed:', err));
    }
  }

  return this.prisma.version.create({
    data: {
      projectId,
      versionName: dto.versionName,
      url: dto.url,
      memo: dto.memo,
      urlType,
      isActive: true,
    },
  });
}
```

Update `VersionModule` to import `ScreenshotModule`.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: Screenshot 모듈 구현 (Playwright 캡쳐 + Supabase Storage)"
```

---

### Task 9: Notification Module

**Files:**
- Create: `apps/api/src/notification/notification.module.ts`
- Create: `apps/api/src/notification/notification.controller.ts`
- Create: `apps/api/src/notification/notification.service.ts`
- Create: `apps/api/src/notification/notification.gateway.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/comment/comment.controller.ts` (trigger notifications)

- [ ] **Step 1: Create NotificationService**

```typescript
// apps/api/src/notification/notification.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, commentId: string, type: NotificationType) {
    return this.prisma.notification.create({
      data: { userId, commentId, type },
      include: {
        comment: {
          select: {
            content: true,
            version: { select: { versionName: true, project: { select: { name: true, slug: true } } } },
          },
        },
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        comment: {
          select: {
            content: true,
            author: { select: { name: true, avatarUrl: true } },
            guestName: true,
            version: { select: { id: true, versionName: true, project: { select: { name: true, slug: true } } } },
          },
        },
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async createForMention(commentContent: string, commentId: string) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [...commentContent.matchAll(mentionRegex)].map((m) => m[1]);

    if (mentions.length === 0) return;

    const users = await this.prisma.user.findMany({
      where: { name: { in: mentions } },
      select: { id: true },
    });

    for (const user of users) {
      await this.create(user.id, commentId, 'MENTION');
    }
  }
}
```

- [ ] **Step 2: Create NotificationController**

```typescript
// apps/api/src/notification/notification.controller.ts
import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.notificationService.findAllByUser(user.id);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: any) {
    return this.notificationService.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationService.markAllAsRead(user.id);
  }
}
```

- [ ] **Step 3: Create NotificationGateway for realtime notification push**

```typescript
// apps/api/src/notification/notification.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
  namespace: '/notifications',
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  emitNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('newNotification', notification);
  }
}
```

- [ ] **Step 4: Create NotificationModule and register**

```typescript
// apps/api/src/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
```

Add `NotificationModule` to `AppModule` imports.

- [ ] **Step 5: Integrate notifications into CommentController**

Update `CommentController` to inject `NotificationService` and trigger notifications on new reply, resolve, and mention:

```typescript
// In CommentController.create():
async create(...) {
  const comment = await this.commentService.create(versionId, user?.id ?? null, dto);
  this.commentGateway.emitNewComment(versionId, comment);

  // Notify on reply
  if (dto.parentId) {
    const parent = await this.prisma.comment.findUnique({ where: { id: dto.parentId } });
    if (parent?.authorId && parent.authorId !== user?.id) {
      await this.notificationService.create(parent.authorId, comment.id, 'REPLY');
    }
  }

  // Notify on mentions
  await this.notificationService.createForMention(dto.content, comment.id);

  return comment;
}

// In CommentController.resolve():
async resolve(...) {
  const comment = await this.commentService.resolve(id);
  this.commentGateway.emitResolveComment(versionId, id, comment.isResolved);

  if (comment.authorId && comment.authorId !== user?.id) {
    await this.notificationService.create(comment.authorId, comment.id, 'RESOLVE');
  }

  return comment;
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: Notification 모듈 구현 (인앱 알림, 멘션, 답글, Resolve)"
```

---

### Task 10: Dockerfile & Final Integration

**Files:**
- Create: `apps/api/Dockerfile`
- Modify: `apps/api/src/app.module.ts` (final version with all modules)

- [ ] **Step 1: Verify final AppModule has all modules**

```typescript
// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { VersionModule } from './version/version.module';
import { CommentModule } from './comment/comment.module';
import { ReactionModule } from './reaction/reaction.module';
import { ScreenshotModule } from './screenshot/screenshot.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProjectModule,
    VersionModule,
    CommentModule,
    ReactionModule,
    ScreenshotModule,
    NotificationModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 2: Create Dockerfile**

```dockerfile
# apps/api/Dockerfile
FROM node:22-slim AS builder

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN pnpm build

FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y \
    openssl \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxrandr2 libgbm1 libpango-1.0-0 libcairo2 \
    libasound2 libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

RUN npx playwright install chromium

ENV NODE_ENV=production
EXPOSE 3012

CMD ["node", "dist/main"]
```

- [ ] **Step 3: Run all e2e tests**

Run: `cd apps/api && pnpm test:e2e`
Expected: All tests pass

- [ ] **Step 4: Test local server**

Run: `cd apps/api && pnpm dev`
Expected: Server starts on port 3012, no errors

Test endpoints:
- `curl http://localhost:3012/auth/me` → 401
- `curl http://localhost:3012/projects` → 401

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: Dockerfile 및 최종 통합 완료 (Phase 1 Backend)"
```

---

## Summary

| Task | Module | Key Features |
|------|--------|-------------|
| 1 | Scaffolding | Monorepo, Nest.js setup, configs |
| 2 | Prisma | Schema (7 models), migrations |
| 3 | Auth | Google/GitHub OAuth, JWT, guards |
| 4 | Project | CRUD, slug generation, ownership |
| 5 | Version | CRUD, URL type auto-detection, active version |
| 6 | Comment | CRUD, threads, resolve, WebSocket realtime |
| 7 | Reaction | Emoji toggle (add/remove) |
| 8 | Screenshot | Playwright 4-viewport capture, Supabase upload |
| 9 | Notification | In-app alerts (mention, reply, resolve) |
| 10 | Docker | Dockerfile, final integration test |
