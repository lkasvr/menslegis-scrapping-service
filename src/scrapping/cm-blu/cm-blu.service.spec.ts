import { Test, TestingModule } from '@nestjs/testing';
import { CmBluService } from './cm-blu.service';

describe('CmBluService', () => {
  let service: CmBluService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CmBluService],
    }).compile();

    service = module.get<CmBluService>(CmBluService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
