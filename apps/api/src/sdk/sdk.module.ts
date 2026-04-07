import { Module } from '@nestjs/common';
import { SdkController } from './sdk.controller';
import { SdkService } from './sdk.service';
import { SdkReviewGateway } from './sdk-review.gateway';
import { ScreenshotModule } from '@/screenshot/screenshot.module';

@Module({
  imports: [ScreenshotModule],
  controllers: [SdkController],
  providers: [SdkService, SdkReviewGateway],
  exports: [SdkService, SdkReviewGateway],
})
export class SdkModule {}
