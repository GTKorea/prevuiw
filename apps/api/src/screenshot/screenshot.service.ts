import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { Viewport } from '@prisma/client';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';
import * as sharp from 'sharp';

@Injectable()
export class ScreenshotService {
  private readonly logger = new Logger(ScreenshotService.name);
  private s3: S3Client | null = null;
  private bucket: string;
  private region: string;
  private localUploadDir: string;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    const accessKeyId = this.config.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get('AWS_SECRET_ACCESS_KEY');
    this.region = this.config.get('AWS_REGION') || 'ap-northeast-2';
    this.bucket = this.config.get('AWS_S3_BUCKET') || 'prevuiw-screenshots';

    if (accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        region: this.region,
        credentials: { accessKeyId, secretAccessKey },
      });
      this.logger.log(`S3 configured: bucket=${this.bucket}, region=${this.region}`);
    }

    this.localUploadDir = join(process.cwd(), 'uploads', 'screenshots');
  }

  private async compressImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  }

  async hasScreenshot(versionId: string, viewport: Viewport, pageUrl: string): Promise<boolean> {
    const count = await this.prisma.screenshot.count({
      where: { versionId, viewport, pageUrl },
    });
    return count > 0;
  }

  async uploadFromClient(
    versionId: string,
    viewport: Viewport,
    pageUrl: string,
    buffer: Buffer,
  ) {
    const exists = await this.hasScreenshot(versionId, viewport, pageUrl);
    if (exists) return null;

    // Compress before upload
    const compressed = await this.compressImage(buffer);
    const originalKB = Math.round(buffer.length / 1024);
    const compressedKB = Math.round(compressed.length / 1024);
    this.logger.log(`Screenshot compressed: ${originalKB}KB → ${compressedKB}KB (${Math.round((1 - compressed.length / buffer.length) * 100)}% reduction)`);

    if (this.s3) {
      return this.uploadToS3(versionId, viewport, pageUrl, compressed);
    }

    return this.uploadToLocal(versionId, viewport, pageUrl, compressed);
  }

  private async uploadToS3(
    versionId: string,
    viewport: Viewport,
    pageUrl: string,
    buffer: Buffer,
  ) {
    const hash = createHash('md5').update(pageUrl).digest('hex').slice(0, 12);
    const key = `screenshots/${versionId}/${viewport}/${hash}-${Date.now()}.webp`;

    try {
      await this.s3!.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: 'image/webp',
      }));

      const imageUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

      return this.prisma.screenshot.create({
        data: { versionId, viewport, pageUrl, imageUrl },
      });
    } catch (error) {
      this.logger.error(`S3 upload failed:`, error);
      // Fallback to local
      return this.uploadToLocal(versionId, viewport, pageUrl, buffer);
    }
  }

  private async uploadToLocal(
    versionId: string,
    viewport: Viewport,
    pageUrl: string,
    buffer: Buffer,
  ) {
    const dir = join(this.localUploadDir, versionId, viewport);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const hash = createHash('md5').update(pageUrl).digest('hex').slice(0, 12);
    const fileName = `${hash}-${Date.now()}.webp`;
    const filePath = join(dir, fileName);
    writeFileSync(filePath, buffer);

    const apiUrl = this.config.get('API_URL') || `http://localhost:${this.config.get('API_PORT') || 3012}`;
    const imageUrl = `${apiUrl}/uploads/screenshots/${versionId}/${viewport}/${fileName}`;

    this.logger.log(`Screenshot saved locally: ${filePath}`);

    return this.prisma.screenshot.create({
      data: { versionId, viewport, pageUrl, imageUrl },
    });
  }

  async findByVersion(versionId: string, viewport?: Viewport) {
    return this.prisma.screenshot.findMany({
      where: {
        versionId,
        ...(viewport ? { viewport } : {}),
      },
      orderBy: { capturedAt: 'desc' },
    });
  }
}
