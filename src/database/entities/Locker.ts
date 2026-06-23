import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Station } from './Station.js';
import { Package } from './Package.js';

export type LockerSize = 'small' | 'medium' | 'large';
export type LockerStatus = 'available' | 'occupied';

@Entity('lockers')
@Index('idx_lockers_station_id', ['station_id'])
@Index('idx_lockers_status', ['status'])
export class Locker {
  @PrimaryColumn({ type: 'varchar', length: 191 })
  id!: string;

  @Column({ type: 'varchar', length: 191 })
  station_id!: string;

  @Column({ type: 'enum', enum: ['small', 'medium', 'large'] })
  size!: LockerSize;

  @Column({ type: 'enum', enum: ['available', 'occupied'], default: 'available' })
  status!: LockerStatus;

  @Column({ type: 'varchar', length: 191 })
  label!: string;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Station, (station) => station.lockers, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'station_id' })
  station!: Station;

  @OneToMany(() => Package, (pkg) => pkg.locker)
  packages!: Package[];
}
