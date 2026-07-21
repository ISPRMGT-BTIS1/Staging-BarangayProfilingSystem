import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { type INestApplication } from '@nestjs/common';

let app: INestApplication;

async function bootstrap(): Promise<INestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.enableCors();
    await app.init();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  const instance = app.getHttpAdapter().getInstance();
  instance(req, res);
}
