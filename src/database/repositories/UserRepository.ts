import { Repository } from 'typeorm';
import { User } from '@/database/entities/User.js';
import { BaseRepository } from '@/database/repositories/BaseRepository.js';

export class UserRepository extends BaseRepository<User> {
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
