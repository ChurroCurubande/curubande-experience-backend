import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tour } from './tour.entity';

@Entity('tour_clicks')
@Index(['tour'])
@Index(['clicked_at'])
export class TourClick {
  @PrimaryGeneratedColumn({ name: 'id_click' })
  id_click: number;

  @ManyToOne(() => Tour, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tour_id', referencedColumnName: 'id_tour' })
  tour: Tour;

  @CreateDateColumn({ name: 'clicked_at', type: 'timestamptz' })
  clicked_at: Date;
}
