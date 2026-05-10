import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tour } from './tour.entity';

@Entity('tour_reservations')
export class TourReservation {
  @PrimaryGeneratedColumn({ name: 'id_reservation' })
  id_reservation: number;

  @ManyToOne(() => Tour, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tour_id', referencedColumnName: 'id_tour' })
  tour: Tour;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  phone: string;

  @Column({ name: 'reservation_date', type: 'date', nullable: false })
  reservation_date: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}
