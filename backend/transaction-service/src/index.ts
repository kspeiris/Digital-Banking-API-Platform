import dotenv from 'dotenv';
import app from './app';
import { logger } from 'shared-common';
import { SchedulerService } from './services/scheduler.service';

dotenv.config();

const PORT = process.env.PORT || 3004;

const scheduler = new SchedulerService();
scheduler.start();

app.listen(PORT, () => {
  logger.info(`transaction-service listening on port ${PORT}`);
});
