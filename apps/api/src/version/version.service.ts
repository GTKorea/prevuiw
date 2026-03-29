import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UrlType } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateVersionDto } from './dto/version.dto';
import { validateExternalUrl } from '@/common/utils/url-validator';

const IMMUTABLE_PATTERNS = [
  /^https:\/\/[\w-]+-[\w]{6,}\.vercel\.app/,       // Vercel
  /^https:\/\/[\w]+-{2}[\w-]+\.netlify\.app/,       // Netlify
  /^https:\/\/[\w]+\.[\w-]+\.pages\.dev/,            // Cloudflare Pages
  /^https:\/\/pr-\d+\.[\w-]+\.amplifyapp\.com/,     // AWS Amplify
  /^https:\/\/[\w-]+-pr-\d+\.onrender\.com/,        // Render
];

@Injectable()
export class VersionService {
  constructor(private prisma: PrismaService) {}

  detectUrlType(url: string): UrlType {
    const isImmutable = IMMUTABLE_PATTERNS.some((pattern) => pattern.test(url));
    return isImmutable ? UrlType.IMMUTABLE : UrlType.MUTABLE;
  }

  async create(projectId: string, userId: string, dto: CreateVersionDto) {
    validateExternalUrl(dto.url);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with id "${projectId}" not found`);
    }

    if (project.isGuest) {
      throw new ForbiddenException('Guest projects do not support version management. Sign in to add versions.');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to create a version for this project');
    }

    // Deactivate all previous active versions
    await this.prisma.version.updateMany({
      where: { projectId, isActive: true },
      data: { isActive: false },
    });

    const urlType = this.detectUrlType(dto.url);

    return this.prisma.version.create({
      data: {
        projectId,
        versionName: dto.versionName,
        url: dto.url,
        memo: dto.memo,
        urlType,
        isActive: true,
      },
      include: {
        _count: {
          select: { comments: true },
        },
        screenshots: true,
      },
    });
  }

  async findAllByProject(projectId: string) {
    return this.prisma.version.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { comments: true },
        },
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
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!version) {
      throw new NotFoundException(`Version with id "${id}" not found`);
    }

    return version;
  }
}
