import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SdkService {
  constructor(private prisma: PrismaService) {}

  async validateKey(key: string) {
    return this.prisma.project.findUnique({
      where: { publishableKey: key },
      select: { id: true, publishableKey: true, name: true },
    });
  }

  async resolveVersion(projectKey: string, currentUrl: string) {
    const project = await this.prisma.project.findUnique({
      where: { publishableKey: projectKey },
      include: {
        versions: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project || project.versions.length === 0) return null;

    let matchedVersion = null;
    try {
      const incoming = new URL(currentUrl);
      const incomingOrigin = incoming.origin;
      matchedVersion = project.versions.find((v) => {
        try {
          const vUrl = new URL(v.url);
          return vUrl.origin === incomingOrigin;
        } catch {
          return false;
        }
      });
    } catch {
      // Invalid URL, fall through to latest
    }

    const version = matchedVersion || project.versions[0];
    return {
      versionId: version.id,
      projectId: project.id,
      versionName: version.versionName,
    };
  }
}
