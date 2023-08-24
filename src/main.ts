import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalConfig } from './config/global.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(GlobalConfig.getPort());
}
bootstrap();
