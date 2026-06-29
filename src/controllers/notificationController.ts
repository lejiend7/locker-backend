import { type Request, type Response } from 'express';
import { NotificationRepositoryInterface } from '@/database/repositories/interfaces/NotificationRepositoryInterface.ts';
import { buildApiResponse } from '@/utils/response.ts';

function toNumber(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export class NotificationController {
  constructor(private readonly notificationRepository: NotificationRepositoryInterface) {}

  list = async (req: Request, res: Response) => {
    const userId = toNumber(req.authUser?.sub);

    if (!userId) {
      return res.status(401).json(
        buildApiResponse({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
          data: [],
          errors: ['Unauthorized'],
        })
      );
    }

    const notifications = await this.notificationRepository.findByUserId(userId);
    const payload = notifications.map((notification) => ({
      id: String(notification.id),
      user_id: String(notification.user_id),
      package_id: String(notification.package_id),
      package_name: notification.package?.package_code ?? `Package ${notification.package_id}`,
      title: notification.title,
      body: notification.body,
      locker_label: notification.locker_label,
      pickup_code: notification.pickup_code,
      is_read: notification.is_read,
      created_at: notification.created_at,
    }));

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: 'Notifications fetched successfully',
        data: payload,
      })
    );
  };

  markRead = async (req: Request, res: Response) => {
    const userId = toNumber(req.authUser?.sub);
    const notificationId = toNumber(req.params.notificationId);

    if (!userId || !notificationId) {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: 'Invalid notification id',
          data: [],
          errors: ['Invalid notification id'],
        })
      );
    }

    const notification = await this.notificationRepository.findById(notificationId);

    if (!notification || notification.user_id !== userId) {
      return res.status(404).json(
        buildApiResponse({
          success: false,
          statusCode: 404,
          message: 'Notification not found',
          data: [],
          errors: ['Notification not found'],
        })
      );
    }

    const updated = await this.notificationRepository.markAsRead(notificationId);

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: 'Notification marked as read',
        data: updated,
      })
    );
  };
}