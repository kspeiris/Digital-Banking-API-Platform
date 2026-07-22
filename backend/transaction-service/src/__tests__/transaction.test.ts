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
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    beneficiary: {
      findUnique: jest.fn(),
    },
    transaction: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
    },
    scheduledTransfer: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
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

describe('Transaction Service APIs', () => {
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

  describe('POST /api/v1/transactions/internal', () => {
    it('should successfully execute internal transfer', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      const mockSourceAcc = {
        id: 'd3b07384-d113-4956-a5db-e7c5b59c0862',
        customerId: 'cust-uuid-1',
        accountNumber: '111111111',
        status: 'ACTIVE',
        availableBalance: 50000,
        currency: 'LKR',
        customer: mockCustomer,
      };
      const mockDestAcc = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        customerId: 'cust-uuid-2',
        accountNumber: '222222222',
        status: 'ACTIVE',
        customer: { userId: 'user-uuid-2' },
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.account.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockSourceAcc)
        .mockResolvedValueOnce(mockDestAcc);

      // Aggregate mock for daily spent
      (prisma.transaction.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: null, fee: null },
      });
      // Duplicate check mock
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/transactions/internal')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          fromAccountId: 'd3b07384-d113-4956-a5db-e7c5b59c0862',
          toAccountId: '123e4567-e89b-12d3-a456-426614174000',
          amount: 10000,
          description: 'Rent',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.transactionReference).toBeDefined();
    });

    it('should fail with insufficient balance', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      const mockSourceAcc = {
        id: 'd3b07384-d113-4956-a5db-e7c5b59c0862',
        customerId: 'cust-uuid-1',
        accountNumber: '111111111',
        status: 'ACTIVE',
        availableBalance: 100, // Insufficient!
        currency: 'LKR',
        customer: mockCustomer,
      };
      const mockDestAcc = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        customerId: 'cust-uuid-2',
        accountNumber: '222222222',
        status: 'ACTIVE',
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.account.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockSourceAcc)
        .mockResolvedValueOnce(mockDestAcc);

      const res = await request(app)
        .post('/api/v1/transactions/internal')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          fromAccountId: 'd3b07384-d113-4956-a5db-e7c5b59c0862',
          toAccountId: '123e4567-e89b-12d3-a456-426614174000',
          amount: 10000,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Insufficient account balance');
    });
  });
});
