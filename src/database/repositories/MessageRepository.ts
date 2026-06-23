import { Repository } from 'typeorm';
import { Message } from '../entities/Message.js';
import { BaseRepository } from './BaseRepository.js';

export class MessageRepository extends BaseRepository<Message> {
  constructor(repository: Repository<Message>) {
    super(repository);
  }

  async findByUserId(user_id: number): Promise<Message[]> {
    return this.repository.find({
      where: { user_id } as any,
      order: { created_at: 'DESC' } as any,
    });
  }

  async findUnreadByUserId(user_id: number): Promise<Message[]> {
    return this.repository.find({
      where: { user_id, is_read: false } as any,
      order: { created_at: 'DESC' } as any,
    });
  }

  async markAsRead(id: number): Promise<Message | null> {
    const message = await this.findById(id);
    if (message) {
      message.is_read = true;
      return this.repository.save(message);
    }
    return null;
  }
}
