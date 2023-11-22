import { Injectable } from '@nestjs/common';
import { ScrappingService } from './scrapping/scrapping.service';
import { StrategyService } from './scrapping/strategies/strategy.service';
import { CmbStrategyService } from './scrapping/strategies/cmb/cmb.service';

@Injectable()
export class AppService {
  constructor(
    private readonly scrappingService: ScrappingService<StrategyService>,
  ) {}

  getHello() {
    const cmbStrategyService = new CmbStrategyService();
    this.scrappingService.setScrappingStrategy(cmbStrategyService);
    this.scrappingService.init();
  }
}
