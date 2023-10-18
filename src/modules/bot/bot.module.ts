import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { GlobalConfig } from '../../config/global.config';
import * as LocalSession from 'telegraf-session-local';
import { BotGateway } from './bot.gateway';
import { UserModule } from '../user/user.module';
import { CommonService } from '../common/services/common.service';
import { sessionPath } from '../common/constants/session';
import { BotService } from './bot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from '../../entities/game.entity';
import { QuizeEntity } from '../../entities/quize.entity';
import { GameModule } from '../game/game.module';

const sessions = new LocalSession({ database: sessionPath });
@Module({
  imports: [
    TypeOrmModule.forFeature([GameEntity, QuizeEntity]),
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: GlobalConfig.getTelegramBotToken(),
    }),
    UserModule,
    GameModule,
  ],
  controllers: [],
  providers: [BotGateway, CommonService, BotService],
})
export class BotModule {}
