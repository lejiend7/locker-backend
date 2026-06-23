import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Locker } from './Locker.js';

export type StationType = 'mall' | 'office' | 'residential';

@Entity('stations')
export class Station {
  @PrimaryColumn({ type: 'varchar', length: 191 })
  id!: string;

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
