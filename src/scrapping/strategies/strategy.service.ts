import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class StrategyService {
  abstract scrape(): void;
}
