import './env'; // MUST be first — loads .env before any other module reads process.env
import app from './app';
import { logger } from 'shared-common';


const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  logger.info(`account-service listening on port ${PORT}`);
});
