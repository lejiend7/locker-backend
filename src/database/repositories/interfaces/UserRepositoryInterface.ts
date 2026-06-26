import { User } from '@/database/entities/User.ts';

export interface UserRepositoryInterface {
  findByEmail(email: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
}
