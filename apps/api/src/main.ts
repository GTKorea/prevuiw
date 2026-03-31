import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
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
  const app = await NestFactory.create(AppModule);

  app.useWebSocketAdapter(new CorsIoAdapter(app));

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
