import dotenv from 'dotenv';
import app from './app';
import { logger } from 'shared-common';

dotenv.config();

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  logger.info(`card-service listening on port ${PORT}`);
});
