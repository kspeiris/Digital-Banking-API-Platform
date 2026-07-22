import express from 'express';
import cors from 'cors';
import { logger, setServiceMeta } from 'shared-common';
import notificationRouter from './routes/notification.routes';
import { errorMiddleware } from './middleware/error.middleware';

setServiceMeta('notification-service');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'UP',
    service: 'notification-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/notifications', notificationRouter);

app.use(errorMiddleware);

export default app;
