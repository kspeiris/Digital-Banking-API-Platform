import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

jest.mock('../config/database', () => ({
  prisma: {
    customer: {
      findUnique: jest.fn(),
    },
    card: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    cardLimit: {
      upsert: jest.fn(),
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

describe('Card Service APIs', () => {
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

  describe('GET /api/v1/cards', () => {
    it('should return customer cards masked', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      const mockCards = [
        {
          id: 'card-uuid-1',
          accountId: 'acc-uuid-1',
          cardNumber: '4532718293847561',
          cardType: 'DEBIT',
          expiry: '12/29',
          cvvHash: 'hash',
          status: 'ACTIVE',
          onlineEnabled: true,
          internationalEnabled: false,
          limits: null,
        },
      ];

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.card.findMany as jest.Mock).mockResolvedValue(mockCards);

      const res = await request(app)
        .get('/api/v1/cards')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].maskedNumber).toBe('**** **** **** 7561');
      expect(res.body.data[0].cardNetwork).toBe('VISA');
    });
  });

  describe('PUT /api/v1/cards/freeze', () => {
    it('should freeze card successfully', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      const mockCard = {
        id: 'card-uuid-1',
        cardNumber: '4532718293847561',
        status: 'ACTIVE',
        account: { customerId: 'cust-uuid-1', customer: mockCustomer },
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.card.findUnique as jest.Mock).mockResolvedValue(mockCard);
      (prisma.card.update as jest.Mock).mockResolvedValue({ ...mockCard, status: 'FROZEN' });

      const res = await request(app)
        .put('/api/v1/cards/freeze')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ cardId: 'd3b07384-d113-4956-a5db-e7c5b59c0862', reason: 'Lost' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Card frozen successfully');
    });
  });

  describe('PUT /api/v1/cards/pin', () => {
    it('should change PIN successfully when current PIN is correct', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      const currentPinHash = await bcrypt.hash('1234', 10);
      const mockCard = {
        id: 'card-uuid-1',
        cardNumber: '4532718293847561',
        status: 'ACTIVE',
        cvvHash: currentPinHash,
        account: { customerId: 'cust-uuid-1', customer: mockCustomer },
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.card.findUnique as jest.Mock).mockResolvedValue(mockCard);
      (prisma.card.update as jest.Mock).mockResolvedValue(mockCard);

      const res = await request(app)
        .put('/api/v1/cards/pin')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          cardId: 'd3b07384-d113-4956-a5db-e7c5b59c0862',
          currentPin: '1234',
          newPin: '5678',
          confirmPin: '5678',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('PIN updated successfully');
    });

    it('should fail with incorrect current PIN', async () => {
      const mockCustomer = { id: 'cust-uuid-1', userId: 'user-uuid-1' };
      const currentPinHash = await bcrypt.hash('1234', 10);
      const mockCard = {
        id: 'card-uuid-1',
        cardNumber: '4532718293847561',
        status: 'ACTIVE',
        cvvHash: currentPinHash,
        account: { customerId: 'cust-uuid-1', customer: mockCustomer },
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.card.findUnique as jest.Mock).mockResolvedValue(mockCard);

      const res = await request(app)
        .put('/api/v1/cards/pin')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          cardId: 'd3b07384-d113-4956-a5db-e7c5b59c0862',
          currentPin: '9999', // Incorrect!
          newPin: '5678',
          confirmPin: '5678',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Current PIN is incorrect');
    });
  });
});
