import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { GoogleStrategy } from '@/auth/strategies/google.strategy';
import { GithubStrategy } from '@/auth/strategies/github.strategy';

class GoogleStrategyStub {
  name = 'google';
}

class GithubStrategyStub {
  name = 'github';
}

class ThrottlerGuardStub extends ThrottlerGuard {
  async canActivate(): Promise<boolean> {
    return true;
  }
}

export interface TestContext {
  app: INestApplication;
  prisma: PrismaService;
  jwtService: JwtService;
}

export async function createTestApp(): Promise<TestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(GoogleStrategy)
    .useClass(GoogleStrategyStub)
    .overrideProvider(GithubStrategy)
    .useClass(GithubStrategyStub)
    .overrideGuard(ThrottlerGuard)
    .useClass(ThrottlerGuardStub)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const prisma = moduleFixture.get<PrismaService>(PrismaService);
  const jwtService = moduleFixture.get<JwtService>(JwtService);

  await app.init();

  return { app, prisma, jwtService };
}

export async function createTestUser(
  prisma: PrismaService,
  jwtService: JwtService,
  prefix: string,
): Promise<{ user: any; token: string }> {
  const user = await prisma.user.create({
    data: {
      email: `test-${prefix}-${Date.now()}@example.com`,
      name: `${prefix} E2E User`,
      provider: 'GITHUB',
      providerId: `${prefix}-e2e-${Date.now()}`,
    },
  });
  const token = jwtService.sign({ sub: user.id, email: user.email });
  return { user, token };
}

export async function closeTestApp(ctx: TestContext) {
  if (ctx.prisma) await ctx.prisma.$disconnect();
  if (ctx.app) await ctx.app.close();
}
