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
import { Message } from '@/database/entities/Message.ts';

export type PackageSize = 'small' | 'medium' | 'large';
export type DeliveryStatus = 'ASSIGNED_TO_AGENT' | 'READY_TO_PICK' | 'PICKED';

@Entity('packages')
@Index('idx_packages_locker_id', ['locker_id'])
@Index('idx_packages_user_id', ['user_id'])
@Index('idx_packages_delivery_status', ['delivery_status'])
@Unique(['pickup_code'])
export class Package {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'int' })
  locker_id!: number;

  @Column({ type: 'int' })
  user_id!: number;

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
  deposited_at!: Date | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  pickup_at!: Date | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  retrieved_at!: Date | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  storage_price!: number | null;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Locker, (locker) => locker.packages, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'locker_id' })
  locker!: Locker;

  @ManyToOne(() => User, (user) => user.packages, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Message, (msg) => msg.package)
  messages!: Message[];
}
