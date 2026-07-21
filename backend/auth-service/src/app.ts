import express from 'express';
import cors from 'cors';
import { errorMiddleware, logger, setServiceMeta } from 'shared-common';

setServiceMeta('auth-service');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'UP',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

// Basic routing placeholder for Phase 3
app.post('/api/v1/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint placeholder' });
});

app.post('/api/v1/auth/register', (req, res) => {
  res.json({ message: 'Register endpoint placeholder' });
});

app.use(errorMiddleware);

export default app;
