import express from 'express';
import cors from 'cors';
import { logger, setServiceMeta, requestIdMiddleware, morganMiddleware } from 'shared-common';
import transactionRouter from './routes/transaction.routes';
import { errorMiddleware } from './middleware/error.middleware';

setServiceMeta('transaction-service');

const app = express();

app.use(requestIdMiddleware);
app.use(morganMiddleware);
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'UP',
    service: 'transaction-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/transactions', transactionRouter);

app.use(errorMiddleware);

export default app;
