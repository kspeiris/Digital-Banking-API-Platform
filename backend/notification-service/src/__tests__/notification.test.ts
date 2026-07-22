import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';

jest.mock('../config/database', () => ({
  prisma: {
    notification: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

const JWT_SECRET = 'fallback-secret';
process.env.JWT_SECRET = JWT_SECRET;

const customerToken = jwt.sign(
  { id: 'user-uuid-1', email: 'customer@test.com', role: 'CUSTOMER' },
  JWT_SECRET
);

describe('Notification Service APIs', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return UP status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('should return notification history with dynamic categories', async () => {
      const mockNotifications = [
        {
          id: 'notif-uuid-1',
          userId: 'user-uuid-1',
          title: 'Money Transfer Successful',
          message: 'LKR 25,000 transferred successfully.',
          type: 'PUSH',
          isRead: false,
          createdAt: new Date('2026-07-22T10:30:00Z'),
        },
      ];

      (prisma.notification.count as jest.Mock).mockResolvedValue(1);
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(mockNotifications);

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].category).toBe('TRANSFER');
      expect(res.body.data[0].read).toBe(false);
    });
  });

  describe('PUT /api/v1/notifications/read', () => {
    it('should mark notifications as read successfully', async () => {
      (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

      const res = await request(app)
        .put('/api/v1/notifications/read')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ notificationIds: ['d3b07384-d113-4956-a5db-e7c5b59c0862'] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Notifications marked as read');
    });
  });

  describe('DELETE /api/v1/notifications/:id', () => {
    it('should delete notification successfully if owner', async () => {
      const mockNotification = {
        id: 'notif-uuid-1',
        userId: 'user-uuid-1',
        title: 'Alert',
        message: 'Info',
      };

      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(mockNotification);
      (prisma.notification.delete as jest.Mock).mockResolvedValue(mockNotification);

      const res = await request(app)
        .delete('/api/v1/notifications/d3b07384-d113-4956-a5db-e7c5b59c0862')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Notification deleted successfully');
    });

    it('should return 403 if not owner', async () => {
      const mockNotification = {
        id: 'notif-uuid-1',
        userId: 'user-uuid-other',
        title: 'Alert',
        message: 'Info',
      };

      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(mockNotification);

      const res = await request(app)
        .delete('/api/v1/notifications/d3b07384-d113-4956-a5db-e7c5b59c0862')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('permission');
    });
  });
});
