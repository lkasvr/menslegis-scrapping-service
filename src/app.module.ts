import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScrappingModule } from './scrapping/scrapping.module';

@Module({
  imports: [ScrappingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
