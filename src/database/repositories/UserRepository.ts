import { Repository } from 'typeorm';
import { User } from '@/database/entities/User.ts';
import { BaseRepository } from '@/database/repositories/BaseRepository.ts';
import { UserRepositoryInterface } from '@/database/repositories/interfaces/UserRepositoryInterface.ts';

export class UserRepository extends BaseRepository<User> implements UserRepositoryInterface {
  constructor(repository: Repository<User>) {
    super(repository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email } as any);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }
}
