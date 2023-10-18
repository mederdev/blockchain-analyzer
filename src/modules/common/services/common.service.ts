import { BadRequestException, Global, Injectable } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
@Global()
export class CommonService {
  private readonly redis: Redis;
  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getClient();
  }
  async get(id = ''): Promise<any | null> {
    if (!id) {
      return null;
    }

    const user = await this.redis.get(id);

    if (!user) {
      return null;
    }

    return JSON.parse(user);
  }

  async del(id = '') {
    try {
      this.redis.del(id);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async set(id: string, data) {
    await this.redis.set(id, JSON.stringify(data));
  }
  async getRoomUsersId(roomId: number) {
    try {
      const room = await this.get(`room:${roomId}`);
      return room?.users;
    } catch (err) {
      console.log('Error', err.message);
      return [];
    }
  }
}
