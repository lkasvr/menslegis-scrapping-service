import { Module } from '@nestjs/common';
import { ScrappingService } from './scrapping.service';
import { ScrappingController } from './scrapping.controller';

@Module({
  controllers: [ScrappingController],
  providers: [ScrappingService],
})
export class ScrappingModule {}
