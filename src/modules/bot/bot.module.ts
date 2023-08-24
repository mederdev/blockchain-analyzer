import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { GlobalConfig } from '../../config/global.config';
import * as LocalSession from 'telegraf-session-local';
import { BotGateway } from './bot.gateway';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { UserModule } from '../user/user.module';
import { CommonService } from '../common/services/common.service';
import { sessionPath } from '../common/constants/session';

const sessions = new LocalSession({ database: sessionPath });
@Module({
  imports: [
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: GlobalConfig.getTelegramBotToken(),
    }),
    BlockchainModule,
    UserModule,
  ],
  controllers: [],
  providers: [BotGateway, CommonService],
})
export class BotModule {}
