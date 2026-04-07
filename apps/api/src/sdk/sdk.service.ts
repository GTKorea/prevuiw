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

  async resolveVersion(projectKey: string, versionKey: string) {
    const project = await this.prisma.project.findUnique({
      where: { publishableKey: projectKey },
      select: { id: true, name: true },
    });

    if (!project) return null;

    const version = await this.prisma.version.findUnique({
      where: { versionKey },
      select: {
        id: true,
        versionName: true,
        domain: true,
        projectId: true,
      },
    });

    if (!version || version.projectId !== project.id) return null;

    return {
      versionId: version.id,
      projectId: project.id,
      versionName: version.versionName,
      domain: version.domain,
    };
  }

  async validateInviteToken(versionKey: string, inviteToken: string) {
    const version = await this.prisma.version.findUnique({
      where: { versionKey },
      select: { id: true, inviteToken: true, projectId: true },
    });

    if (!version || version.inviteToken !== inviteToken) return null;

    return { versionId: version.id, projectId: version.projectId };
  }

  async markSdkConnected(projectKey: string) {
    await this.prisma.project.update({
      where: { publishableKey: projectKey },
      data: { sdkConnected: true },
    });
  }
}
