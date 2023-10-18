import { Column, Entity, Index, OneToMany } from 'typeorm';
import { MyBaseEntity } from './base/my-base.entity';
import { QuizeEntity } from './quize.entity';

@Entity('games')
@Index(['uid'], { unique: true })
export class GameEntity extends MyBaseEntity {
  @Column()
  title: string;

  @Column()
  uid: number;

  @OneToMany('QuizeEntity', 'game')
  quizes: QuizeEntity[];
}
