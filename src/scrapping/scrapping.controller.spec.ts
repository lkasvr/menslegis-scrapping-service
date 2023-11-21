import { Test, TestingModule } from '@nestjs/testing';
import { ScrappingController } from './scrapping.controller';
import { ScrappingService } from './scrapping.service';

describe('ScrappingController', () => {
  let controller: ScrappingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScrappingController],
      providers: [ScrappingService],
    }).compile();

    controller = module.get<ScrappingController>(ScrappingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
