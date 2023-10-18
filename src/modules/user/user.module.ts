import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { CommonModule } from '../common/common.module';
import { GameService } from '../game/game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from '../../entities/game.entity';
import { QuizeEntity } from '../../entities/quize.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameEntity, QuizeEntity]), CommonModule],
  providers: [UserService, GameService],
  exports: [UserService],
})
export class UserModule {}
