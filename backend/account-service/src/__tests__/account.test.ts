import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';

jest.mock('../config/database', () => ({
  prisma: {
    customer: {
      findUnique: jest.fn(),
    },
    account: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

const JWT_SECRET = 'fallback-secret';
process.env.JWT_SECRET = JWT_SECRET;

const customerToken = jwt.sign(
  { id: 'user-uuid-1', email: 'customer@test.com', role: 'CUSTOMER' },
  JWT_SECRET
);

describe('Account Service APIs', () => {
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

  describe('GET /api/v1/accounts', () => {
    it('should fail if no token is provided', async () => {
      const res = await request(app).get('/api/v1/accounts');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return customer accounts', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      const mockAccounts = [
        {
          id: 'acc-uuid-1',
          customerId: 'cust-uuid-1',
          accountNumber: '12345678',
          accountType: 'Savings',
          currency: 'LKR',
          balance: 1000.0,
          availableBalance: 950.0,
          status: 'ACTIVE',
        },
      ];

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.account.findMany as jest.Mock).mockResolvedValue(mockAccounts);

      const res = await request(app)
        .get('/api/v1/accounts')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].accountNumber).toBe('12345678');
    });
  });

  describe('GET /api/v1/accounts/:id', () => {
    it('should return account details if owner', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      const mockAccount = {
        id: 'd3b07384-d113-4956-a5db-e7c5b59c0862',
        customerId: 'cust-uuid-1',
        accountNumber: '12345678',
        accountType: 'Savings',
        currency: 'LKR',
        balance: 1000.0,
        availableBalance: 950.0,
        branch: 'Colombo Main',
        status: 'ACTIVE',
        createdAt: new Date('2026-01-01'),
        customer: mockCustomer,
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.account.findUnique as jest.Mock).mockResolvedValue(mockAccount);

      const res = await request(app)
        .get('/api/v1/accounts/d3b07384-d113-4956-a5db-e7c5b59c0862')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accountNumber).toBe('12345678');
    });

    it('should return 403 if not owner', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      const mockAccount = {
        id: 'd3b07384-d113-4956-a5db-e7c5b59c0862',
        customerId: 'cust-uuid-other',
        accountNumber: '12345678',
        accountType: 'Savings',
        currency: 'LKR',
        balance: 1000.0,
        availableBalance: 950.0,
        branch: 'Colombo Main',
        status: 'ACTIVE',
        createdAt: new Date('2026-01-01'),
        customer: { id: 'cust-uuid-other' },
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.account.findUnique as jest.Mock).mockResolvedValue(mockAccount);

      const res = await request(app)
        .get('/api/v1/accounts/d3b07384-d113-4956-a5db-e7c5b59c0862')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('permission');
    });
  });

  describe('GET /api/v1/accounts/:id/statements', () => {
    it('should reject invalid date range', async () => {
      const res = await request(app)
        .get('/api/v1/accounts/d3b07384-d113-4956-a5db-e7c5b59c0862/statements?from=2026-02-01&to=2026-01-01')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid statement date range');
    });
  });
});
