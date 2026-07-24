import express from 'express';
import cors from 'cors';
import { logger, setServiceMeta, requestIdMiddleware, morganMiddleware } from 'shared-common';
import beneficiaryRouter from './routes/beneficiary.routes';
import { errorMiddleware } from './middleware/error.middleware';

setServiceMeta('beneficiary-service');

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
    service: 'beneficiary-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/beneficiaries', beneficiaryRouter);

app.use(errorMiddleware);

export default app;
