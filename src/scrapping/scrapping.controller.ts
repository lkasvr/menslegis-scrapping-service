import { Controller } from '@nestjs/common';
import { StrategyService } from './strategies/strategy.service';
import { ScrappingService } from './scrapping.service';

@Controller()
export class ScrappingController {
  constructor(
    private readonly scrappingService: ScrappingService<StrategyService>,
  ) {}

  public async scrape(scrappingStrategy: StrategyService) {
    const result = await this.scrappingService
      .setScrappingStrategy(scrappingStrategy)
      .execute();
    console.log(result);
  }
}
