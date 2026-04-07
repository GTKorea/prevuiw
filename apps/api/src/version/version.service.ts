import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateVersionDto } from './dto/version.dto';

@Injectable()
export class VersionService {
  constructor(private prisma: PrismaService) {}

  private generateVersionKey(): string {
    return randomBytes(8).toString('base64url');
  }

  private generateInviteToken(): string {
    return randomBytes(16).toString('base64url');
  }

  async create(projectId: string, userId: string, dto: CreateVersionDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with id "${projectId}" not found`);
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to create a version for this project');
    }

    // Deactivate all previous active versions
    await this.prisma.version.updateMany({
      where: { projectId, isActive: true },
      data: { isActive: false },
    });

    const version = await this.prisma.version.create({
      data: {
        projectId,
        versionName: dto.versionName,
        domain: dto.domain,
        versionKey: this.generateVersionKey(),
        inviteToken: this.generateInviteToken(),
        memo: dto.memo,
        isActive: true,
      },
      include: {
        _count: { select: { comments: true } },
        screenshots: true,
      },
    });

    return version;
  }

  async findAllByProject(projectId: string) {
    return this.prisma.version.findMany({
      where: { projectId },
      include: {
        _count: { select: { comments: true } },
        screenshots: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const version = await this.prisma.version.findUnique({
      where: { id },
      include: {
        project: true,
        screenshots: true,
        _count: { select: { comments: true } },
      },
    });

    if (!version) {
      throw new NotFoundException(`Version with id "${id}" not found`);
    }

    return version;
  }

  async findByVersionKey(versionKey: string) {
    return this.prisma.version.findUnique({
      where: { versionKey },
      include: {
        project: { select: { id: true, name: true, publishableKey: true } },
      },
    });
  }
}
