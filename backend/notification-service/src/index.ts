import dotenv from 'dotenv';
import app from './app';
import { logger } from 'shared-common';

dotenv.config();

const PORT = process.env.PORT || 3008;

app.listen(PORT, () => {
  logger.info(`notification-service listening on port ${PORT}`);
});
