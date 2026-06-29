import { User } from '@/database/entities/User.ts';

export interface UserRepositoryInterface {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  create(data: Partial<User>): Promise<User>;
  update(id: number, data: Partial<User>): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
}
