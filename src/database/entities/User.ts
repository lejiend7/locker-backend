import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Unique } from 'typeorm';
import { Package } from './Package.js';
import { Message } from './Message.js';

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

  @OneToMany(() => Package, (pkg) => pkg.user)
  packages!: Package[];

  @OneToMany(() => Message, (msg) => msg.user)
  messages!: Message[];
}
