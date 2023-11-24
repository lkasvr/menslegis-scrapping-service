import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CmBluController } from './scrapping/cm-blu/cm-blu.controller';
//import { CmBluHttpService } from './scrapping/cm-blu/services/cm-blu-http.service';
//import { CmBluDocFormatterService } from './scrapping/cm-blu/services/cm-blu-doc-formatter.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const cmBluController = app.get(CmBluController);
  //const { toProposition } = app.get(CmBluDocFormatterService);
  //const cmBluHttpService = app.get(CmBluHttpService);
  const docs = await cmBluController.getMocoesByYear(2023);

  // docs.forEach(
  //   async (doc) => await cmBluHttpService.propositionPost(toProposition(doc)),
  // );

  console.log(docs);
}
bootstrap();
