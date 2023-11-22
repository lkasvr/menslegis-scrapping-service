import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ScrappingModule } from './scrapping/scrapping.module';
import { CmbStrategyService } from './scrapping/strategies/cmb/cmb.service';
import { ScrappingController } from './scrapping/scrapping.controller';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ScrappingModule);
  const scrapeController = app.get(ScrappingController);
  scrapeController.scrape(new CmbStrategyService());
}
bootstrap();
