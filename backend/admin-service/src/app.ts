import express from 'express';
import cors from 'cors';
import { logger, setServiceMeta } from 'shared-common';
import adminRouter from './routes/admin.routes';
import { errorMiddleware } from './middleware/error.middleware';

setServiceMeta('admin-service');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'UP',
    service: 'admin-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/admin', adminRouter);

app.use(errorMiddleware);

export default app;
