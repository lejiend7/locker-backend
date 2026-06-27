import { User } from '@/database/entities/User.ts';

export interface UserRepositoryInterface {
  findAll(): Promise<User[]>;
  create(data: Partial<User>): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
}
