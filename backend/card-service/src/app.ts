import express from 'express';
import cors from 'cors';
import { logger, setServiceMeta } from 'shared-common';
import cardRouter from './routes/card.routes';
import { errorMiddleware } from './middleware/error.middleware';

setServiceMeta('card-service');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'UP',
    service: 'card-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/cards', cardRouter);

app.use(errorMiddleware);

export default app;
