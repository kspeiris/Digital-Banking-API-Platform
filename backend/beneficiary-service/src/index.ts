import dotenv from 'dotenv';
import app from './app';
import { logger } from 'shared-common';

dotenv.config();

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  logger.info(`beneficiary-service listening on port ${PORT}`);
});
