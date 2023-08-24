import { Module } from '@nestjs/common';
import { CommonService } from './services/common.service';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { GlobalConfig } from '../../config/global.config';

@Module({
  imports: [
    RedisModule.forRoot({
      config: GlobalConfig.getRedisConfig(),
    }),
  ],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
