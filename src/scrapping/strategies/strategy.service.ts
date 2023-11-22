import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class StrategyService {
  public abstract scrape(): Promise<any>;
}
