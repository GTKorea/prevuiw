import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
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
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    PrismaModule,
    AuthModule,
    ProjectModule,
    VersionModule,
    CommentModule,
    ReactionModule,
    ScreenshotModule,
    NotificationModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
