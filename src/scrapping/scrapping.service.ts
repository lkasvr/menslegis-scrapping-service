import { Injectable } from '@nestjs/common';
import { StrategyService } from './strategies/strategy.service';

@Injectable()
export class ScrappingService<T extends StrategyService> {
  private scrappingStrategy: T;

  setScrappingStrategy(strategy: T): this {
    this.scrappingStrategy = strategy;
    return this;
  }

  async execute() {
    return await this.scrappingStrategy.scrape();
  }
}
