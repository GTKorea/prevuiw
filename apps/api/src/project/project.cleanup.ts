import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProjectService } from './project.service';

@Injectable()
export class ProjectCleanup {
  constructor(private projectService: ProjectService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanup() {
    const count = await this.projectService.cleanupExpiredGuests();
    if (count > 0) {
      console.log(`Cleaned up ${count} expired guest projects`);
    }
  }
}
