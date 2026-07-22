import express from 'express';
import cors from 'cors';
import { errorMiddleware, logger, setServiceMeta } from 'shared-common';

setServiceMeta('account-service');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'UP',
    service: 'account-service',
    timestamp: new Date().toISOString()
  });
});

app.use(errorMiddleware);

export default app;
