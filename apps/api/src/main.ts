import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`ERROR: ${envVar} environment variable is required`);
    process.exit(1);
  }
}

class CorsIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    return super.createIOServer(port, {
      ...options,
      cors: {
        origin: true,
        credentials: true,
      },
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve local screenshot uploads
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  app.useWebSocketAdapter(new CorsIoAdapter(app));

  app.use(cookieParser());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.API_PORT || 3012;
  await app.listen(port);
  console.log(`prevuiw API running on port ${port}`);
}
bootstrap();
