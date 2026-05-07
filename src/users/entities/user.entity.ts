import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'id_user' })
  id_user: number;

  @Column({ type: 'varchar', length: 30, unique: true, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  password: string;
}
