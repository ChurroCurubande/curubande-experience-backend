import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('landing_page_content')
export class LandingPageContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  hero_image_path: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
