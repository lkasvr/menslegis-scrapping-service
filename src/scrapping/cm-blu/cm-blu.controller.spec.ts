import { Test, TestingModule } from '@nestjs/testing';
import { CmBluController } from './cm-blu.controller';
import { CmBluService } from './cm-blu.service';

describe('CmBluController', () => {
  let controller: CmBluController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CmBluController],
      providers: [CmBluService],
    }).compile();

    controller = module.get<CmBluController>(CmBluController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
