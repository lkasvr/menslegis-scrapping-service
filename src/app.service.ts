import { Injectable } from '@nestjs/common';
import { ScrappingService } from './scrapping/scrapping.service';
import { StrategyService } from './scrapping/strategies/strategy.service';

@Injectable()
export class AppService {
  constructor(
    private readonly scrappingService: ScrappingService<StrategyService>,
  ) {}

  getHello() {}
}
