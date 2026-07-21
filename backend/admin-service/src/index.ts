import dotenv from 'dotenv';
import app from './app';
import { logger } from 'shared-common';

dotenv.config();

const PORT = process.env.PORT || 3009;

app.listen(PORT, () => {
  logger.info(`admin-service listening on port ${PORT}`);
});
