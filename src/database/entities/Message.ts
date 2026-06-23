import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './User.js';
import { Package } from './Package.js';

@Entity('messages')
@Index('idx_messages_user_id', ['user_id'])
@Index('idx_messages_package_id', ['package_id'])
export class Message {
  @PrimaryColumn({ type: 'varchar', length: 191 })
  id!: string;

  @Column({ type: 'varchar', length: 191 })
  user_id!: string;

  @Column({ type: 'varchar', length: 191 })
  package_id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'varchar', length: 191 })
  locker_label!: string;

  @Column({ type: 'varchar', length: 191 })
  pickup_code!: string;

  @Column({ type: 'boolean', default: false })
  is_read!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Package, (pkg) => pkg.messages, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'package_id' })
  package!: Package;
}
