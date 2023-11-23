import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
//import { CmbStrategyService } from './scrapping/strategies/cmb/cmb.service';
import { AppModule } from './app.module';
import { CmBluController } from './scrapping/cm-blu/cm-blu.controller';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const cmBluController = app.get(CmBluController);
  const result = await cmBluController.getMotions(
    'https://digital.camarablu.sc.gov.br/documentos/tipo:proposicoes-2/subtipo:mocao-43/numero:/numero_final:/ano:2023/ordem:/autor:adriano-pereira-450/assunto:/processo:/documento_data_inicial:/documento_data_final:/publicacoes-legais:/situacao:/termo:/operadorTermo2:AND/termo2:/protocolo:',
  );

  console.log(result);
}
bootstrap();
