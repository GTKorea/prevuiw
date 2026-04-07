import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Viewport } from '@prisma/client';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '@/auth/guards/optional-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthUser } from '@/common/types/auth';
import { CommentService } from './comment.service';
import { CommentGateway } from './comment.gateway';
import { CreateCommentDto } from './dto/comment.dto';

@Controller('versions/:versionId/comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly commentGateway: CommentGateway,
  ) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async create(
    @Param('versionId') versionId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.commentService.create(
      versionId,
      user?.id ?? null,
      dto,
    );
    this.commentGateway.emitNewComment(versionId, comment);
    return comment;
  }

  @Get()
  @SkipThrottle()
  findAll(
    @Param('versionId') versionId: string,
    @Query('viewport') viewport?: Viewport,
  ) {
    return this.commentService.findAllByVersion(versionId, viewport);
  }

  @Patch(':id/resolve')
  @UseGuards(OptionalAuthGuard)
  async resolve(
    @Param('versionId') versionId: string,
    @Param('id') id: string,
  ) {
    const comment = await this.commentService.resolve(id);
    this.commentGateway.emitResolveComment(versionId, id, comment.isResolved);
    return comment;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('versionId') versionId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const comment = await this.commentService.delete(id, user.id);
    this.commentGateway.emitDeleteComment(versionId, id);
    return comment;
  }
}
