import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authMiddleware } from 'shared-common';
import { authorize } from '../middleware/authorize';

const router = Router();
const controller = new NotificationController();

router.get('/', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.getNotifications);
router.put('/read', authMiddleware, authorize(['CUSTOMER']), controller.markAsRead);
router.delete('/:id', authMiddleware, authorize(['CUSTOMER']), controller.deleteNotification);

export default router;
