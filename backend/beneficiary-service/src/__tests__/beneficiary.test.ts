import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';

jest.mock('../config/database', () => ({
  prisma: {
    customer: {
      findUnique: jest.fn(),
    },
    beneficiary: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const JWT_SECRET = 'fallback-secret';
process.env.JWT_SECRET = JWT_SECRET;

const customerToken = jwt.sign(
  { id: 'user-uuid-1', email: 'customer@test.com', role: 'CUSTOMER' },
  JWT_SECRET
);

describe('Beneficiary Service APIs', () => {
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

  describe('GET /api/v1/beneficiaries', () => {
    it('should return customer beneficiaries', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      const mockBeneficiaries = [
        {
          id: 'ben-uuid-1',
          customerId: 'cust-uuid-1',
          nickname: 'Mom',
          accountName: 'Jane Doe',
          accountNumber: '1234567890',
          bankName: 'Commercial Bank',
          branch: 'Colombo',
          favorite: true,
        },
      ];

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.beneficiary.findMany as jest.Mock).mockResolvedValue(mockBeneficiaries);

      const res = await request(app)
        .get('/api/v1/beneficiaries')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].nickname).toBe('Mom');
    });
  });

  describe('POST /api/v1/beneficiaries', () => {
    it('should add a beneficiary successfully', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(null); // No duplicates
      (prisma.beneficiary.create as jest.Mock).mockResolvedValue({ id: 'ben-uuid-1' });

      const res = await request(app)
        .post('/api/v1/beneficiaries')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          nickname: 'Mom',
          accountName: 'Jane Doe',
          accountNumber: '1002003004',
          bankName: 'Commercial Bank',
          branch: 'Colombo',
          favorite: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Beneficiary added successfully');
    });

    it('should fail if duplicate account number exists', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-id' });

      const res = await request(app)
        .post('/api/v1/beneficiaries')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          nickname: 'Mom',
          accountName: 'Jane Doe',
          accountNumber: '1002003004',
          bankName: 'Commercial Bank',
          branch: 'Colombo',
          favorite: false,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Beneficiary already exists');
    });
  });

  describe('PUT /api/v1/beneficiaries/:id', () => {
    it('should update beneficiary successfully', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      const mockBeneficiary = { id: 'ben-uuid-1', customerId: 'cust-uuid-1' };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.beneficiary.findUnique as jest.Mock).mockResolvedValue(mockBeneficiary);
      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/v1/beneficiaries/d3b07384-d113-4956-a5db-e7c5b59c0862')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          nickname: 'Office Account',
          favorite: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Beneficiary updated successfully');
    });
  });
});
