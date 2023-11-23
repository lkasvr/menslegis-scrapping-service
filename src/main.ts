import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CmBluController } from './scrapping/cm-blu/cm-blu.controller';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const cmBluController = app.get(CmBluController);
  const result = await cmBluController.getMocoesByYear(2023);

  console.log(result);
}
bootstrap();
