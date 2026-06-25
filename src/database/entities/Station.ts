import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Locker } from './Locker.ts';

export type StationType = 'mall' | 'office' | 'residential';

@Entity('stations')
export class Station {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'enum', enum: ['mall', 'office', 'residential'] })
  type!: StationType;

  @Column({ type: 'varchar', length: 191 })
  city!: string;

  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Locker, (locker) => locker.station)
  lockers!: Locker[];
}
