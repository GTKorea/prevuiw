import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { VersionService } from './version.service';
import { CreateVersionDto } from './dto/version.dto';

@Controller('projects/:projectId/versions')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateVersionDto,
  ) {
    return this.versionService.create(projectId, user.id, dto);
  }

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.versionService.findAllByProject(projectId);
  }

  @Get(':versionId')
  findById(@Param('versionId') versionId: string) {
    return this.versionService.findById(versionId);
  }
}
