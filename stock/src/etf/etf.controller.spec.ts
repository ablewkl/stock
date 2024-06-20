import { Test, TestingModule } from '@nestjs/testing';
import { EtfController } from './etf.controller';

describe('EtfController', () => {
  let controller: EtfController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EtfController],
    }).compile();

    controller = module.get<EtfController>(EtfController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
