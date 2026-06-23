import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany, Unique } from 'typeorm';
import { Package } from './Package.js';
import { Message } from './Message.js';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryColumn({ type: 'varchar', length: 191 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 191 })
  email!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Package, (pkg) => pkg.user)
  packages!: Package[];

  @OneToMany(() => Message, (msg) => msg.user)
  messages!: Message[];
}
