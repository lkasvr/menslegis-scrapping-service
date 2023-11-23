import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { CmBluModule } from './scrapping/cm-blu/cm-blu.module';

@Module({
  imports: [CacheModule.register({ isGlobal: true }), CmBluModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
