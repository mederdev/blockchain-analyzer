import { Module } from '@nestjs/common';
import { BotModule } from './modules/bot/bot.module';
import { CommonService } from './modules/common/services/common.service';
import { CommonModule } from './modules/common/common.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalConfig } from './config/global.config';
import { GameModule } from './modules/game/game.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(GlobalConfig.getDBConfig()),
    BotModule,
    CommonModule,
    GameModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [CommonService],
})
export class AppModule {}
