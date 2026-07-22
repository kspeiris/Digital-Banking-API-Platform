import express from 'express';
import cors from 'cors';
import { logger, setServiceMeta } from 'shared-common';
import developerRouter from './routes/developer.routes';
import { errorMiddleware } from './middleware/error.middleware';

setServiceMeta('developer-service');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'UP',
    service: 'developer-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/developer', developerRouter);

app.use(errorMiddleware);

export default app;
