import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '@/auth/guards/optional-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateProjectDto,
    @Req() req: Request,
  ) {
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
    const guestId = req.headers['x-guest-id']?.toString();
    return this.projectService.create(user?.id ?? null, dto, { clientIp, guestId });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: any) {
    return this.projectService.findAllByUser(user.id);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.projectService.findBySlug(slug);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('slug') slug: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.update(slug, user.id, dto);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('slug') slug: string, @CurrentUser() user: any) {
    return this.projectService.delete(slug, user.id);
  }

  @Post(':id/generate-key')
  @UseGuards(JwtAuthGuard)
  generateKey(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectService.generatePublishableKey(id, user.id);
  }
}
