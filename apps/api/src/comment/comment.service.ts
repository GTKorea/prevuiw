import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(versionId: string, userId: string | null, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        versionId,
        authorId: userId ?? null,
        guestName: userId ? null : (dto.guestName ?? null),
        content: dto.content,
        posX: dto.posX,
        posY: dto.posY,
        selectionArea: dto.selectionArea ?? undefined,
        parentId: dto.parentId ?? null,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async findAllByVersion(versionId: string) {
    return this.prisma.comment.findMany({
      where: { versionId, parentId: null },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        replies: {
          include: {
            author: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
            reactions: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        reactions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolve(commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id "${commentId}" not found`);
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { isResolved: !comment.isResolved },
    });
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.authorId !== userId) {
      throw new NotFoundException(`Comment with id "${commentId}" not found`);
    }

    return this.prisma.comment.delete({ where: { id: commentId } });
  }
}
