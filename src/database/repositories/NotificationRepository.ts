import { Repository } from 'typeorm';
import { Notification } from '@/database/entities/Notification.ts';
import { BaseRepository } from '@/database/repositories/BaseRepository.ts';
import { NotificationRepositoryInterface } from '@/database/repositories/interfaces/NotificationRepositoryInterface.ts';

export class NotificationRepository
  extends BaseRepository<Notification>
  implements NotificationRepositoryInterface
{
  constructor(repository: Repository<Notification>) {
    super(repository);
  }

  async findByUserId(user_id: number): Promise<Notification[]> {
    return this.repository.find({
      where: { user_id } as any,
      order: { created_at: 'DESC' } as any,
      relations: ['package'],
    });
  }

  async findUnreadByUserId(user_id: number): Promise<Notification[]> {
    return this.repository.find({
      where: { user_id, is_read: false } as any,
      order: { created_at: 'DESC' } as any,
    });
  }

  async markAsRead(id: number): Promise<Notification | null> {
    const notification = await this.findById(id);
    if (notification) {
      notification.is_read = true;
      return this.repository.save(notification);
    }
    return null;
  }
}