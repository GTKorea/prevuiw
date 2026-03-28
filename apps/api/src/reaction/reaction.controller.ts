import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ReactionService } from './reaction.service';

export class CreateReactionDto {
  @IsString()
  @IsNotEmpty()
  emoji: string;
}

@Controller('comments/:commentId/reactions')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  toggle(
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateReactionDto,
  ) {
    return this.reactionService.toggle(commentId, user.id, dto.emoji);
  }
}
