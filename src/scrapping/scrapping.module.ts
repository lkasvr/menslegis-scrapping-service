import { Module } from '@nestjs/common';
import { ScrappingService } from './scrapping.service';
import { ScrappingController } from './scrapping.controller';
import { CmbStrategyService } from './strategies/cmb/cmb.service';

@Module({
  controllers: [ScrappingController],
  providers: [ScrappingService, CmbStrategyService],
  exports: [ScrappingService],
})
export class ScrappingModule {}
