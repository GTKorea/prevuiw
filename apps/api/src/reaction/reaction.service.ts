import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ReactionService {
  constructor(private prisma: PrismaService) {}

  async toggle(commentId: string, userId: string, emoji: string) {
    const existing = await this.prisma.reaction.findUnique({
      where: { commentId_userId_emoji: { commentId, userId, emoji } },
    });

    if (existing) {
      await this.prisma.reaction.delete({ where: { id: existing.id } });
      return { action: 'removed' as const };
    }

    const reaction = await this.prisma.reaction.create({
      data: { commentId, userId, emoji },
    });

    return { action: 'added' as const, reaction };
  }
}
