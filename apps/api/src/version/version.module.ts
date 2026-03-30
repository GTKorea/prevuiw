import { Module } from '@nestjs/common';
import { VersionController } from './version.controller';
import { VersionService } from './version.service';
import { ScreenshotModule } from '@/screenshot/screenshot.module';

@Module({
  imports: [ScreenshotModule],
  controllers: [VersionController],
  providers: [VersionService],
  exports: [VersionService],
})
export class VersionModule {}
