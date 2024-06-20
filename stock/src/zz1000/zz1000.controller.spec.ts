import { Test, TestingModule } from '@nestjs/testing';
import { Zz1000Controller } from './zz1000.controller';

describe('Zz1000Controller', () => {
  let controller: Zz1000Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Zz1000Controller],
    }).compile();

    controller = module.get<Zz1000Controller>(Zz1000Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
