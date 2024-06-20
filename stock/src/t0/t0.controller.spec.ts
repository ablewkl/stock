import { Test, TestingModule } from '@nestjs/testing';
import { T0Controller } from './t0.controller';

describe('T0Controller', () => {
  let controller: T0Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [T0Controller],
    }).compile();

    controller = module.get<T0Controller>(T0Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
