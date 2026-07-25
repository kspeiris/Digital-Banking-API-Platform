import express from 'express';
import cors from 'cors';
import { errorMiddleware, logger, setServiceMeta, requestIdMiddleware, morganMiddleware } from 'shared-common';
import path from 'path';
import customerRouter from './routes/customer.routes';

setServiceMeta('customer-service');

const app = express();

app.use(requestIdMiddleware);
app.use(morganMiddleware);
app.use(cors());
app.use(express.json());

// Serve static upload folders
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'UP',
    service: 'customer-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/customers', customerRouter);

app.use(errorMiddleware);

export default app;
