import 'dotenv/config';
import app from './app';
import { logger } from 'shared-common';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`auth-service listening on port ${PORT}`);
});
