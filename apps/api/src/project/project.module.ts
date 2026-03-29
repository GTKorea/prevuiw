import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectCleanup } from './project.cleanup';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, ProjectCleanup],
  exports: [ProjectService],
})
export class ProjectModule {}
