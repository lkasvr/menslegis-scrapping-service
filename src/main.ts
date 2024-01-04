import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CmBluController } from './scrapping/cm-blu/cm-blu.controller';
import { CmBluHttpService } from './scrapping/cm-blu/services/cm-blu-http.service';
import { CmBluDocFormatterService } from './scrapping/cm-blu/services/cm-blu-doc-formatter.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const cmBluController = app.get(CmBluController);
  const { toProposition } = app.get(CmBluDocFormatterService);
  const cmBluHttpService = app.get(CmBluHttpService);

  try {
    const docs = await cmBluController.getMocoesByYear(2023);

    // Use Promise.all para paralelizar as chamadas de API
    const propositions = docs.map((doc) => toProposition(doc));
    console.log(propositions);
    console.info(`[NÚMERO DE REGISTROS] | ${docs.length}`);
    const result = await cmBluHttpService.putPropositions(propositions);

    console.log('[RETURN putPropositions()]', result);
    console.log('[TOTAL DE REQUISIÇÕES REALIZADAS]', result.length);
    // Resultados das chamadas de API
    // console.log('Results:', results);
  } catch (error) {
    // Lide com erros aqui
    console.error('Error:', error);
  } finally {
    // Certifique-se de encerrar o contexto do Nest.js quando concluído
    await app.close();
  }
}
bootstrap();
