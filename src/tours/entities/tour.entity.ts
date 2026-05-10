import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TourGalleryItem = {
  path: string;
  type: 'image' | 'video';
  mime_type: string;
  original_name: string;
};

@Entity('tours')
export class Tour {
  @PrimaryGeneratedColumn({ name: 'id_tour' })
  id_tour: number;

  @Column({ type: 'varchar', length: 120, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false, default: '' })
  description: string;

  @Column({ type: 'jsonb', default: [] })
  activities: string[];

  @Column({ type: 'varchar', length: 80, nullable: false })
  duration: string;

  @Column({ name: 'number_of_people', type: 'int', nullable: false })
  number_of_people: number;

  @Column({
    name: 'preview_image_path',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  preview_image_path: string | null;

  @Column({ type: 'jsonb', default: [] })
  gallery: TourGalleryItem[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
