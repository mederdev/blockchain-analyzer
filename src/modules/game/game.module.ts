import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizeEntity } from '../../entities/quize.entity';
import { GameEntity } from '../../entities/game.entity';
import { CommonService } from '../common/services/common.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuizeEntity, GameEntity])],
  controllers: [GameController],
  providers: [GameService, CommonService],
  exports: [GameService],
})
export class GameModule {}
