import { Injectable, Logger } from '@nestjs/common';
import { RolesEnum } from '../enums/roles.enum';
import { User } from '../types/user.type';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class CommonService {
  private readonly logger = new Logger(CommonService.name);
  private readonly redis: Redis;
  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getClient();
  }
  async getUser(id = ''): Promise<User | null> {
    if (!id) {
      return null;
    }

    const user = await this.redis.get(id);

    if (!user) {
      return null;
    }

    return JSON.parse(user);
  }

  async setUser(id: string, data) {
    await this.redis.set(id, JSON.stringify(data));
  }

  async updateLimits() {
    try {
      const keys = await this.scanKeys('0');

      const queue = keys.map((i) => this.updateUser(i));

      await Promise.all(queue);
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  private async updateUser(key: string) {
    try {
      const user = await this.getUser(key);
      user.limit = this.getLimit(user.type);
      await this.setUser(key, user);
    } catch (err) {
      throw new Error(err.message);
    }
  }
  getLimit(type: RolesEnum) {
    return type === RolesEnum.USER ? 5 : 20;
  }

  async scanKeys(cursor, pattern = '*', keys = []): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
        (error, response) => {
          if (error) {
            reject(error);
            return;
          }

          const [nextCursor, batchKeys] = response;
          keys.push(...batchKeys);

          if (nextCursor === '0') {
            resolve(keys);
          } else {
            this.scanKeys(nextCursor, pattern, keys)
              .then(resolve)
              .catch(reject);
          }
        },
      );
    });
  }
}
