import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const suffix = randomBytes(8).toString('hex');
    return `${base}-${suffix}`;
  }

  async create(userId: string, dto: CreateProjectDto) {
    const slug = this.generateSlug(dto.name);

    return this.prisma.project.create({
      data: {
        name: dto.name,
        slug,
        ownerId: userId,
      },
      include: {
        _count: {
          select: { versions: true },
        },
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: { versions: true },
        },
        versions: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            versionName: true,
            url: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { comments: true },
            },
            screenshots: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with slug "${slug}" not found`);
    }

    return project;
  }

  async update(slug: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { slug } });

    if (!project) {
      throw new NotFoundException(`Project with slug "${slug}" not found`);
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this project');
    }

    return this.prisma.project.update({
      where: { slug },
      data: { name: dto.name },
      include: {
        _count: {
          select: { versions: true },
        },
      },
    });
  }

  async delete(slug: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { slug } });

    if (!project) {
      throw new NotFoundException(`Project with slug "${slug}" not found`);
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this project');
    }

    await this.prisma.project.delete({ where: { slug } });
  }
}
