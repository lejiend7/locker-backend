import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Unique } from 'typeorm';
import { Package } from '@/database/entities/Package.ts';
import { Message } from '@/database/entities/Message.ts';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 191 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 50, default: 'customer' })
  role!: 'customer' | 'delivery_agent' | 'admin';

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Package, (pkg) => pkg.customer)
  packages!: Package[];

  @OneToMany(() => Package, (pkg) => pkg.agent)
  assignedPackages!: Package[];

  @OneToMany(() => Message, (msg) => msg.user)
  messages!: Message[];
}
