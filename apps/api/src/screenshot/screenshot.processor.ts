import { Injectable, Logger } from '@nestjs/common';

const VIEWPORTS = [
  { name: 'MOBILE_375', width: 375, height: 812 },
  { name: 'TABLET_768', width: 768, height: 1024 },
  { name: 'LAPTOP_1440', width: 1440, height: 900 },
  { name: 'DESKTOP_1920', width: 1920, height: 1080 },
] as const;

@Injectable()
export class ScreenshotProcessor {
  private readonly logger = new Logger(ScreenshotProcessor.name);

  async captureAll(url: string): Promise<Array<{ viewport: string; buffer: Buffer }>> {
    // Dynamically import playwright to avoid issues if not installed
    const { chromium } = await import('playwright');
    let browser = null;
    const results = [];
    try {
      browser = await chromium.launch({ headless: true });
      for (const vp of VIEWPORTS) {
        const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const buffer = await page.screenshot({ fullPage: true });
        results.push({ viewport: vp.name, buffer: Buffer.from(buffer) });
        await context.close();
      }
    } catch (error) {
      this.logger.error(`Screenshot capture failed for ${url}:`, error);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
    return results;
  }
}
