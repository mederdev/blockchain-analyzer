import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MyBaseEntity } from './base/my-base.entity';
import { GameEntity } from './game.entity';

@Entity('quizes')
export class QuizeEntity extends MyBaseEntity {
  @Column()
  question: string;

  @Column({
    nullable: true,
  })
  figure: string;

  @Column({
    nullable: true,
  })
  answers: string;

  @Column({
    name: 'game_id',
    nullable: true,
  })
  gameId: number;

  @ManyToOne('GameEntity', 'quizes')
  @JoinColumn({ name: 'game_id' })
  game: GameEntity;
}
