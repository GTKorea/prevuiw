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
