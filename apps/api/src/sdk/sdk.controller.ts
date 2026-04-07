import {
  Controller,
  Get,
  HttpCode,
  Post,
  Body,
  Res,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Viewport } from '@prisma/client';
import { Response } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { SdkService } from './sdk.service';
import { ScreenshotService } from '@/screenshot/screenshot.service';

@Controller()
export class SdkController {
  private sdkBundlePath: string;
  private isDev: boolean;
  private cachedBundle: string | null = null;

  constructor(
    private readonly sdkService: SdkService,
    private readonly screenshotService: ScreenshotService,
    private readonly configService: ConfigService,
  ) {
    this.sdkBundlePath = join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'packages',
      'sdk',
      'dist',
      'index.global.js',
    );
    this.isDev = this.configService.get('NODE_ENV') !== 'production';

    // Cache in production only
    if (!this.isDev && existsSync(this.sdkBundlePath)) {
      this.cachedBundle = readFileSync(this.sdkBundlePath, 'utf-8');
    }
  }

  @Get('sdk.js')
  @SkipThrottle()
  serve(@Res() res: Response) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.removeHeader('Access-Control-Allow-Credentials');
    res.removeHeader('Vary');

    if (this.isDev) {
      // Dev: read fresh on every request
      res.setHeader('Cache-Control', 'no-cache');
      if (existsSync(this.sdkBundlePath)) {
        res.send(readFileSync(this.sdkBundlePath, 'utf-8'));
      } else {
        res.status(404).send('// SDK bundle not built. Run: pnpm --filter @prevuiw/sdk build');
      }
    } else {
      // Production: serve cached
      res.setHeader('Cache-Control', 'public, max-age=3600');
      if (this.cachedBundle) {
        res.send(this.cachedBundle);
      } else {
        res.status(404).send('// SDK bundle not built.');
      }
    }
  }

  @Post('sdk/resolve-version')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  async resolveVersion(
    @Body() body: { projectKey: string; versionKey: string; inviteToken: string },
  ) {
    if (!body.projectKey || !body.versionKey)
      throw new UnauthorizedException('Project key and version key required');

    // Validate invite token
    if (!body.inviteToken) {
      throw new UnauthorizedException('Invite token required');
    }

    const tokenValid = await this.sdkService.validateInviteToken(
      body.versionKey,
      body.inviteToken,
    );
    if (!tokenValid) {
      throw new UnauthorizedException('Invalid invite token');
    }

    const result = await this.sdkService.resolveVersion(
      body.projectKey,
      body.versionKey,
    );
    if (!result)
      throw new UnauthorizedException(
        'Invalid project key or version not found',
      );

    // Mark SDK as connected for this project
    await this.sdkService.markSdkConnected(body.projectKey);

    return result;
  }

  @Post('sdk/validate-token')
  @HttpCode(200)
  async validateToken(
    @Body() body: { versionKey: string; inviteToken: string },
  ) {
    if (!body.versionKey || !body.inviteToken) {
      throw new UnauthorizedException('Version key and invite token required');
    }

    const result = await this.sdkService.validateInviteToken(
      body.versionKey,
      body.inviteToken,
    );
    if (!result) {
      throw new UnauthorizedException('Invalid invite token');
    }

    return { valid: true };
  }

  @Post('sdk/screenshot')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('screenshot'))
  async uploadScreenshot(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string },
    @Body() body: { versionKey: string; inviteToken: string; viewport: Viewport; pageUrl: string },
  ) {
    if (!body.versionKey || !body.inviteToken) {
      throw new UnauthorizedException('Version key and invite token required');
    }

    const tokenValid = await this.sdkService.validateInviteToken(
      body.versionKey,
      body.inviteToken,
    );
    if (!tokenValid) {
      throw new UnauthorizedException('Invalid invite token');
    }

    if (!file) return { uploaded: false };

    const result = await this.screenshotService.uploadFromClient(
      tokenValid.versionId,
      body.viewport,
      body.pageUrl,
      file.buffer,
    );

    return { uploaded: !!result, screenshot: result };
  }
}
