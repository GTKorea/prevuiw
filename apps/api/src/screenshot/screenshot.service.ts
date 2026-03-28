import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { ScreenshotProcessor } from './screenshot.processor';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Viewport } from '@prisma/client';

@Injectable()
export class ScreenshotService {
  private readonly logger = new Logger(ScreenshotService.name);
  private supabase: SupabaseClient | null = null;

  constructor(private prisma: PrismaService, private processor: ScreenshotProcessor, private config: ConfigService) {
    const url = this.config.get('SUPABASE_URL');
    const key = this.config.get('SUPABASE_SERVICE_KEY');
    if (url && key) {
      this.supabase = createClient(url, key);
    }
  }

  async captureAndStore(versionId: string, url: string) {
    if (!this.supabase) {
      this.logger.warn('Supabase not configured, skipping screenshot capture');
      return [];
    }
    const captures = await this.processor.captureAll(url);
    const screenshots = [];
    for (const cap of captures) {
      const filePath = `screenshots/${versionId}/${cap.viewport}.png`;
      const { error } = await this.supabase.storage.from('prevuiw').upload(filePath, cap.buffer, { contentType: 'image/png', upsert: true });
      if (error) { this.logger.error(`Upload failed for ${cap.viewport}:`, error); continue; }
      const { data: urlData } = this.supabase.storage.from('prevuiw').getPublicUrl(filePath);
      const screenshot = await this.prisma.screenshot.create({
        data: { versionId, viewport: cap.viewport as Viewport, imageUrl: urlData.publicUrl },
      });
      screenshots.push(screenshot);
    }
    return screenshots;
  }
}
