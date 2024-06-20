import { Test, TestingModule } from '@nestjs/testing';
import { HszsController } from './hszs.controller';

describe('HszsController', () => {
  let controller: HszsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HszsController],
    }).compile();

    controller = module.get<HszsController>(HszsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
