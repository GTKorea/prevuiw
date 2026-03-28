import { Module } from '@nestjs/common';
import { ScreenshotProcessor } from './screenshot.processor';
import { ScreenshotService } from './screenshot.service';

@Module({
  providers: [ScreenshotProcessor, ScreenshotService],
  exports: [ScreenshotService],
})
export class ScreenshotModule {}
