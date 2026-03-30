import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectCleanup } from './project.cleanup';
import { ScreenshotModule } from '@/screenshot/screenshot.module';

@Module({
  imports: [ScreenshotModule],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectCleanup],
  exports: [ProjectService],
})
export class ProjectModule {}
