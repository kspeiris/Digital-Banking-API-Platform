import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';

jest.mock('../config/database', () => ({
  prisma: {
    apiKey: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

const JWT_SECRET = 'fallback-secret';
process.env.JWT_SECRET = JWT_SECRET;

const developerToken = jwt.sign(
  { id: 'dev-uuid-1', email: 'dev@bank.com', role: 'DEVELOPER' },
  JWT_SECRET
);

const customerToken = jwt.sign(
  { id: 'user-uuid-1', email: 'customer@test.com', role: 'CUSTOMER' },
  JWT_SECRET
);

describe('Developer Service APIs', () => {
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

  describe('GET /developer/apis', () => {
    it('should return APIs catalog for DEVELOPER', async () => {
      const res = await request(app)
        .get('/developer/apis')
        .set('Authorization', `Bearer ${developerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(8);
      expect(res.body.data[0].name).toBe('Authentication API');
    });

    it('should reject with 403 for CUSTOMER', async () => {
      const res = await request(app)
        .get('/developer/apis')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Developer privileges required');
    });
  });

  describe('POST /developer/key', () => {
    it('should generate credentials successfully', async () => {
      (prisma.apiKey.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.apiKey.create as jest.Mock).mockResolvedValue({
        id: 'key-uuid-1',
        apiKey: 'pk_live_123',
      });

      const res = await request(app)
        .post('/developer/key')
        .set('Authorization', `Bearer ${developerToken}`)
        .send({ applicationName: 'Mobile Banking App' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.apiKey).toContain('pk_live_');
      expect(res.body.secret).toContain('sk_live_');
    });

    it('should fail if applicationName already exists', async () => {
      (prisma.apiKey.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-key' });

      const res = await request(app)
        .post('/developer/key')
        .set('Authorization', `Bearer ${developerToken}`)
        .send({ applicationName: 'Mobile Banking App' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exists');
    });
  });

  describe('DELETE /developer/key', () => {
    it('should revoke API key successfully', async () => {
      const mockKey = { id: 'key-uuid-1', apiKey: 'pk_live_123', status: 'ACTIVE' };
      (prisma.apiKey.findFirst as jest.Mock).mockResolvedValue(mockKey);
      (prisma.apiKey.update as jest.Mock).mockResolvedValue({ ...mockKey, status: 'REVOKED' });

      const res = await request(app)
        .delete('/developer/key')
        .set('Authorization', `Bearer ${developerToken}`)
        .send({ apiKey: 'pk_live_123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('API key revoked successfully');
    });
  });
});
