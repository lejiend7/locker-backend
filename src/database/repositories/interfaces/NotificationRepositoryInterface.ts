import { Notification } from '@/database/entities/Notification.ts';

export interface NotificationRepositoryInterface {
  create(data: Partial<Notification>): Promise<Notification>;
  findByUserId(user_id: number): Promise<Notification[]>;
  findUnreadByUserId(user_id: number): Promise<Notification[]>;
  markAsRead(id: number): Promise<Notification | null>;
}