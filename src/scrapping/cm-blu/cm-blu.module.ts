import { Module } from '@nestjs/common';
import { CmBluService } from './cm-blu.service';
import { CmBluController } from './cm-blu.controller';
import { HttpModule } from '@nestjs/axios';
import { CmBluHttpService } from './services/cm-blu-http.service';
import { CmBluDocFormatterService } from './services/cm-blu-doc-formatter.service';

@Module({
  imports: [HttpModule],
  controllers: [CmBluController],
  providers: [CmBluService, CmBluHttpService, CmBluDocFormatterService],
})
export class CmBluModule {}
