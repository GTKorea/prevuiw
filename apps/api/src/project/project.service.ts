import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UrlType } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { ScreenshotService } from '@/screenshot/screenshot.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { validateExternalUrl } from '@/common/utils/url-validator';

const IMMUTABLE_PATTERNS = [
  /^https:\/\/[\w-]+-[\w]{6,}\.vercel\.app/,
  /^https:\/\/[\w]+-{2}[\w-]+\.netlify\.app/,
  /^https:\/\/[\w]+\.[\w-]+\.pages\.dev/,
  /^https:\/\/pr-\d+\.[\w-]+\.amplifyapp\.com/,
  /^https:\/\/[\w-]+-pr-\d+\.onrender\.com/,
];

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private prisma: PrismaService,
    private screenshotService: ScreenshotService,
  ) {}

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const suffix = randomBytes(8).toString('hex');
    return `${base}-${suffix}`;
  }

  private detectUrlType(url: string): UrlType {
    return IMMUTABLE_PATTERNS.some((p) => p.test(url)) ? UrlType.IMMUTABLE : UrlType.MUTABLE;
  }

  async create(userId: string | null, dto: CreateProjectDto, guest?: { clientIp: string; guestId?: string }) {
    const isGuest = !userId;

    if (isGuest) {
      const fingerprint = guest?.guestId || guest?.clientIp || 'unknown';
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentGuestProjects = await this.prisma.project.count({
        where: {
          isGuest: true,
          guestId: fingerprint,
          createdAt: { gte: oneDayAgo },
        },
      });

      if (recentGuestProjects >= 2) {
        throw new ForbiddenException('Guest users can create up to 2 projects per day. Sign in for unlimited projects.');
      }
    }

    const slug = this.generateSlug(dto.name);
    const expiresAt = isGuest ? new Date(Date.now() + 48 * 60 * 60 * 1000) : null;

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        slug,
        ownerId: userId,
        isGuest,
        guestId: isGuest ? (guest?.guestId || guest?.clientIp || 'unknown') : null,
        expiresAt,
      },
      include: {
        _count: {
          select: { versions: true },
        },
      },
    });

    if (dto.url) {
      validateExternalUrl(dto.url);
      const urlType = this.detectUrlType(dto.url);
      const version = await this.prisma.version.create({
        data: {
          projectId: project.id,
          versionName: 'v1.0',
          url: dto.url,
          urlType,
          isActive: true,
        },
        select: { id: true },
      });

      if (urlType === UrlType.IMMUTABLE) {
        this.screenshotService
          .captureAndStore(version.id, dto.url)
          .catch((err) => this.logger.error(`Screenshot capture failed for version ${version.id}:`, err));
      }

      return { ...project, firstVersionId: version.id };
    }

    return project;
  }

  async cleanupExpiredGuests(): Promise<number> {
    const result = await this.prisma.project.deleteMany({
      where: {
        isGuest: true,
        expiresAt: { lte: new Date() },
      },
    });
    return result.count;
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

    if (project.isGuest && project.expiresAt && project.expiresAt < new Date()) {
      throw new NotFoundException('This preview has expired. Sign in to create permanent projects.');
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
