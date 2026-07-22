import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';

jest.mock('../config/database', () => {
  const mockPrisma = {
    customer: {
      findUnique: jest.fn(),
    },
    loan: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    loanDocument: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  return { prisma: mockPrisma };
});

const JWT_SECRET = 'fallback-secret';
process.env.JWT_SECRET = JWT_SECRET;

const customerToken = jwt.sign(
  { id: 'user-uuid-1', email: 'customer@test.com', role: 'CUSTOMER' },
  JWT_SECRET
);

describe('Loan Service APIs', () => {
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

  describe('POST /api/v1/loans', () => {
    it('should submit loan application successfully with calculated EMI', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      const mockCreatedLoan = {
        id: 'loan-uuid-1',
        customerId: 'cust-uuid-1',
        loanType: 'PERSONAL',
        requestedAmount: 1000000,
        interestRate: 12.0,
        durationMonths: 60,
        emi: 22244,
        status: 'SUBMITTED',
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      
      // Mock the transaction behavior
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const txMock = {
          loan: {
            create: jest.fn().mockResolvedValue(mockCreatedLoan),
          },
          notification: {
            create: jest.fn().mockResolvedValue({}),
          },
          auditLog: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(txMock);
      });

      const res = await request(app)
        .post('/api/v1/loans')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          loanType: 'PERSONAL',
          requestedAmount: 1000000,
          durationMonths: 60,
          monthlyIncome: 250000,
          employmentType: 'FULL_TIME',
          purpose: 'Home Renovation',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.loanId).toBe('loan-uuid-1');
      expect(res.body.status).toBe('SUBMITTED');
    });

    it('should fail with unsupported loan type', async () => {
      const res = await request(app)
        .post('/api/v1/loans')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          loanType: 'TRAVEL', // Unsupported!
          requestedAmount: 1000000,
          durationMonths: 60,
          monthlyIncome: 250000,
          employmentType: 'FULL_TIME',
          purpose: 'Holiday',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unsupported loan type');
    });
  });

  describe('GET /api/v1/loans/:id', () => {
    it('should return loan details if owner', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      const mockLoan = {
        id: 'loan-uuid-1',
        customerId: 'cust-uuid-1',
        loanType: 'PERSONAL',
        requestedAmount: 1000000,
        approvedAmount: 0,
        interestRate: 12.0,
        durationMonths: 60,
        emi: 22244,
        status: 'SUBMITTED',
        submittedAt: new Date('2026-01-01'),
        customer: mockCustomer,
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockLoan);

      const res = await request(app)
        .get('/api/v1/loans/d3b07384-d113-4956-a5db-e7c5b59c0862')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.loanType).toBe('PERSONAL');
    });

    it('should return 403 if not owner', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      const mockLoan = {
        id: 'loan-uuid-1',
        customerId: 'cust-uuid-other',
        customerId_uuid: 'other',
        submittedAt: new Date('2026-01-01'),
        customer: { id: 'cust-uuid-other' },
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockLoan);

      const res = await request(app)
        .get('/api/v1/loans/d3b07384-d113-4956-a5db-e7c5b59c0862')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('permission');
    });
  });
});
