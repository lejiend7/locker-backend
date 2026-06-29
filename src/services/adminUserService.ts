import bcrypt from 'bcryptjs';
import { UserRepositoryInterface } from '@/database/repositories/interfaces/UserRepositoryInterface.ts';
import { AdminUserListItem, AdminUserServiceInterface } from '@/services/interfaces/AdminUserServiceInterface.ts';

export class AdminUserService implements AdminUserServiceInterface {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async listUsers(): Promise<AdminUserListItem[]> {
    const users = await this.userRepository.findAll();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    }));
  }

  async resetPassword(userId: number, password: string): Promise<AdminUserListItem | null> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return null;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const updated = await this.userRepository.update(user.id, { password: passwordHash });

    if (!updated) {
      return null;
    }

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      created_at: updated.created_at,
    };
  }
}
