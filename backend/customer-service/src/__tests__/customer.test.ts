import request from 'supertest';
import app from '../app';

// Mock the Prisma database client
jest.mock('../config/database', () => ({
  prisma: {
    customer: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock the authentication middleware
jest.mock('shared-common', () => {
  const actual = jest.requireActual('shared-common');
  return {
    ...actual,
    authMiddleware: (req: any, res: any, next: any) => {
      req.user = { id: 'test-user-id', role: 'customer' };
      next();
    },
  };
});

describe('Customer Service APIs', () => {
  describe('GET /health', () => {
    it('should return service status UP', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'UP');
      expect(res.body).toHaveProperty('service', 'customer-service');
    });
  });

  describe('PUT /api/v1/customers/me', () => {
    it('should fail with invalid input values (empty body)', async () => {
      const res = await request(app).put('/api/v1/customers/me').send({});
      expect(res.status).toBe(400); // Zod Error caught as 400
    });
  });
});
