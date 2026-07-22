import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'shared-common';
import { NotificationService } from '../services/notification.service';
import {
  MarkReadSchema,
  DeleteParamSchema,
  HistoryQuerySchema,
} from '../validators/notification.validation';
import { UnauthorizedException } from 'shared-common';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const queryResult = HistoryQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        throw queryResult.error;
      }

      const result = await this.notificationService.getNotifications(
        req.user.id,
        queryResult.data
      );

      res.json({
        success: true,
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  };

  markAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = MarkReadSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      await this.notificationService.markAsRead(req.user.id, bodyResult.data.notificationIds);

      res.json({
        success: true,
        message: 'Notifications marked as read',
      });
    } catch (err) {
      next(err);
    }
  };

  deleteNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const paramResult = DeleteParamSchema.safeParse(req.params);
      if (!paramResult.success) {
        throw paramResult.error;
      }

      await this.notificationService.deleteNotification(req.user.id, paramResult.data.id);

      res.json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}
