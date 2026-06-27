import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Locker } from '@/database/entities/Locker.ts';
import { User } from '@/database/entities/User.ts';
import { Notification } from '@/database/entities/Notification.ts';

export type PackageSize = 'small' | 'medium' | 'large';
export type DeliveryStatus = 'ASSIGNED_TO_AGENT' | 'READY_TO_PICK' | 'PICKED';

@Entity('packages')
@Unique(['package_code'])
@Index('idx_packages_locker_id', ['locker_id'])
@Index('idx_packages_customer_id', ['customer_id'])
@Index('idx_packages_agent_id', ['agent_id'])
@Index('idx_packages_delivery_status', ['delivery_status'])
@Unique(['pickup_code'])
export class Package {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 191 })
  package_code!: string;

  @Column({ type: 'int', nullable: true })
  locker_id!: number | null;

  @Column({ type: 'int' })
  customer_id!: number;

  @Column({ type: 'int', nullable: true })
  agent_id!: number | null;

  @Column({ type: 'enum', enum: ['small', 'medium', 'large'] })
  package_size!: PackageSize;

  @Column({ type: 'enum', enum: ['ASSIGNED_TO_AGENT', 'READY_TO_PICK', 'PICKED'] })
  delivery_status!: DeliveryStatus;

  @Column({ type: 'varchar', length: 191, nullable: true })
  pickup_code!: string | null;

  @Column({ type: 'varchar', length: 255 })
  customer_name!: string;

  @Column({ type: 'datetime', precision: 3 })
  assigned_at!: Date;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  stored_at!: Date | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  pickup_at!: Date | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  retrieved_at!: Date | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  storage_price!: number | null;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Locker, (locker) => locker.packages, {
    nullable: true,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'locker_id' })
  locker!: Locker | null;

  @ManyToOne(() => User, (user) => user.packages, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer!: User;

  @ManyToOne(() => User, (user) => user.assignedPackages, {
    nullable: true,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'agent_id' })
  agent!: User | null;

  @OneToMany(() => Notification, (notification) => notification.package)
  notifications!: Notification[];
}
