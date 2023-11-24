import { Module } from '@nestjs/common';
import { CmBluModule } from './cm-blu/cm-blu.module';
import { ScrappingStandardizeService } from './utils/scrapping-standardize.service';

@Module({
  imports: [CmBluModule],
  providers: [ScrappingStandardizeService],
})
export class ScrappingModule {}
