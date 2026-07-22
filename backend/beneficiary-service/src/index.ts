import './env'; // MUST be first — loads .env before any other module reads process.env
import app from './app';
import { logger } from 'shared-common';


const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  logger.info(`beneficiary-service listening on port ${PORT}`);
});
