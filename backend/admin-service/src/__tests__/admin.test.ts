import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';

jest.mock('../config/database', () => ({
  prisma: {
    customer: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    account: {
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    loan: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    card: {
      count: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    auditLog: {
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

const JWT_SECRET = 'fallback-secret';
process.env.JWT_SECRET = JWT_SECRET;

const adminToken = jwt.sign(
  { id: 'admin-uuid-1', email: 'admin@bank.com', role: 'ADMIN' },
  JWT_SECRET
);

const customerToken = jwt.sign(
  { id: 'user-uuid-1', email: 'customer@test.com', role: 'CUSTOMER' },
  JWT_SECRET
);

describe('Admin Service APIs', () => {
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

  describe('GET /admin/dashboard', () => {
    it('should return dashboard metrics for ADMIN', async () => {
      (prisma.customer.count as jest.Mock).mockResolvedValue(10);
      (prisma.account.count as jest.Mock).mockResolvedValue(15);
      (prisma.transaction.count as jest.Mock).mockResolvedValue(5);
      (prisma.loan.count as jest.Mock).mockResolvedValue(2);
      (prisma.card.count as jest.Mock).mockResolvedValue(8);

      const res = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCustomers).toBe(10);
      expect(res.body.data.activeAccounts).toBe(15);
    });

    it('should reject with 403 for CUSTOMER', async () => {
      const res = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Admin privileges required');
    });
  });

  describe('PUT /admin/customer/freeze', () => {
    it('should freeze customer accounts successfully', async () => {
      const mockCustomer = {
        id: 'cust-uuid-1',
        userId: 'user-uuid-1',
        firstName: 'John',
        lastName: 'Doe',
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.account.updateMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .put('/admin/customer/freeze')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ customerId: 'd3b07384-d113-4956-a5db-e7c5b59c0862', reason: 'Suspicious transactions' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Customer account frozen successfully');
    });
  });

  describe('GET /admin/reports', () => {
    it('should generate report successfully', async () => {
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/admin/reports?type=transactions&format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
    });
  });
});
