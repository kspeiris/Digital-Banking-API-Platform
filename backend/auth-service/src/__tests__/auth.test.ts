import request from 'supertest';
import app from '../app';

// Mock the Prisma database client
jest.mock('../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
    customer: {
      findUnique: jest.fn(),
    },
    otpVerification: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Auth Service APIs', () => {
  describe('GET /health', () => {
    it('should return service UP status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'UP');
      expect(res.body).toHaveProperty('service', 'auth-service');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should fail validation with empty request body', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});
      expect(res.status).toBe(400); // Validation error
    });
  });
});
