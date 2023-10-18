import { Logger } from '@nestjs/common';
import * as process from 'process';
import { RedisClientOptions } from '@liaoliaots/nestjs-redis';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

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

  static getDBConfig(): TypeOrmModuleOptions {
    const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT } = process.env;

    if (DB_USER && DB_PASSWORD && DB_NAME && DB_HOST && DB_PORT) {
      return {
        type: 'postgres',
        host: DB_HOST,
        port: Number(DB_PORT),
        username: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        synchronize: true,
        entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
      };
    } else {
      Logger.error('CONFIG ERROR (DB): BAD ENVIRONMENT');
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
