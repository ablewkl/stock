import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StockController } from './stock/stock.controller';
import { StatisticsController } from './statistics/statistics.controller';
import { EtfController } from './etf/etf.controller';
import { HszsController } from './hszs/hszs.controller';
import { Zz1000Controller } from './zz1000/zz1000.controller';
import { T0Controller } from './t0/t0.controller';

@Module({
  imports: [],
  controllers: [AppController, StockController, StatisticsController, EtfController, HszsController, Zz1000Controller, T0Controller],
  providers: [AppService],
})
export class AppModule {}
