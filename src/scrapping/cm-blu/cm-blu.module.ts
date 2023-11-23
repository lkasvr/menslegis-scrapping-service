import { Module } from '@nestjs/common';
import { CmBluService } from './cm-blu.service';
import { CmBluController } from './cm-blu.controller';

@Module({
  controllers: [CmBluController],
  providers: [CmBluService],
})
export class CmBluModule {}
