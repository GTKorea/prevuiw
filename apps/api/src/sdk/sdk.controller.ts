import {
  Controller,
  Get,
  HttpCode,
  Post,
  Body,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { SdkService } from './sdk.service';

@Controller()
export class SdkController {
  private sdkBundle: string | null = null;

  constructor(private readonly sdkService: SdkService) {
    // Try to load built SDK bundle at startup
    const bundlePath = join(
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
      res
        .status(404)
        .send(
          '// SDK bundle not built. Run: pnpm --filter @prevuiw/sdk build',
        );
    }
  }

  @Post('sdk/resolve-version')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  async resolveVersion(
    @Body() body: { projectKey: string; currentUrl: string },
  ) {
    if (!body.projectKey)
      throw new UnauthorizedException('Project key required');

    const result = await this.sdkService.resolveVersion(
      body.projectKey,
      body.currentUrl,
    );
    if (!result)
      throw new UnauthorizedException(
        'Invalid project key or no active versions',
      );

    return result;
  }
}
