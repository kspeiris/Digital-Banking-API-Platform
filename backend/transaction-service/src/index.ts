import './env'; // MUST be first — loads .env before any other module reads process.env
import app from './app';
import { logger } from 'shared-common';
import { SchedulerService } from './services/scheduler.service';


const PORT = process.env.PORT || 3004;

const scheduler = new SchedulerService();
scheduler.start();

app.listen(PORT, () => {
  logger.info(`transaction-service listening on port ${PORT}`);
});
