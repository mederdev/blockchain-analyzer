import { Logger } from '@nestjs/common';
import * as process from 'process';
import { RedisClientOptions } from '@liaoliaots/nestjs-redis';

export class GlobalConfig {
  static getTelegramBotToken() {
    const { BOT_TOKEN } = process.env;
    if (BOT_TOKEN) {
      return BOT_TOKEN;
    } else {
      Logger.error('CONFIG ERROR (TELEGRAM): BAD ENVIRONMENT');
      process.exit();
    }
  }

  static getRedisConfig(): RedisClientOptions {
    const { REDIS_HOST, REDIS_PORT } = process.env;
    if (REDIS_HOST && REDIS_PORT) {
      return {
        host: REDIS_HOST,
        port: Number(REDIS_PORT),
      };
    } else {
      Logger.error('CONFIG ERROR (REDIS): BAD ENVIRONMENT');
      process.exit();
    }
  }

  static getPort() {
    const { PORT } = process.env;
    if (PORT) {
      return Number(PORT);
    } else {
      Logger.error('CONFIG ERROR (PORT): BAD ENVIRONMENT');
      process.exit();
    }
  }
}
