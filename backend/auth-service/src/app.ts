import express from 'express';
import cors from 'cors';
import { errorMiddleware, logger, setServiceMeta } from 'shared-common';

import authRouter from './routes/auth.routes';

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

app.use('/api/v1/auth', authRouter);

app.use(errorMiddleware);

export default app;
