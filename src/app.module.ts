import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CacheModule } from '@nestjs/cache-manager';

import { ScrappingModule } from './scrapping/scrapping.module';

@Module({
  imports: [CacheModule.register({ isGlobal: true }), ScrappingModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
