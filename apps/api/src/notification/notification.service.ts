import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, commentId: string, type: NotificationType) {
    return this.prisma.notification.create({
      data: { userId, commentId, type },
      include: {
        comment: {
          include: {
            author: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
            version: {
              include: {
                project: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        comment: {
          include: {
            author: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
            version: {
              include: {
                project: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async createForMention(commentContent: string, commentId: string) {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = mentionRegex.exec(commentContent)) !== null) {
      mentions.push(match[1]);
    }

    if (mentions.length === 0) return [];

    const users = await this.prisma.user.findMany({
      where: {
        name: { in: mentions },
      },
      select: { id: true },
    });

    const notifications = await Promise.all(
      users.map((user) =>
        this.create(user.id, commentId, NotificationType.MENTION),
      ),
    );

    return notifications;
  }
}
