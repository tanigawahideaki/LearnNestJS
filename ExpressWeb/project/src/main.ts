import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 静的ファイルのパスを指定する
  app.useStaticAssets(join(__dirname, '..', 'public'));
  // ビューテンプレートのパスを指定する
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  // テンプレートエンジンを指定する
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();
