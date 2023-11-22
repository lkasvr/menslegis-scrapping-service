import { Injectable } from '@nestjs/common';
import { StrategyService } from './strategies/strategy.service';

@Injectable()
export class ScrappingService<T extends StrategyService> {
  private scrappingStrategy: T;

  setScrappingStrategy(strategy: T): void {
    this.scrappingStrategy = strategy;
  }

  init() {
    this.scrappingStrategy.scrape();
  }
}
