import './env'; // MUST be first — loads .env with override before any other module reads process.env
import app from './app';
import { logger } from 'shared-common';

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  logger.info(`customer-service listening on port ${PORT}`);
});
