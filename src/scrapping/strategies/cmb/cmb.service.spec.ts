import { Test, TestingModule } from '@nestjs/testing';
import { CmbStrategyService } from './cmb.service';

describe('CmbService', () => {
  let service: CmbStrategyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CmbStrategyService],
    }).compile();

    service = module.get<CmbStrategyService>(CmbStrategyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
