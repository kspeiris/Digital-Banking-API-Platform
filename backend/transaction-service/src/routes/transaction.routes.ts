import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authMiddleware } from 'shared-common';
import { authorize } from '../middleware/authorize';

const router = Router();
const controller = new TransactionController();

router.post('/internal', authMiddleware, authorize(['CUSTOMER']), controller.executeInternalTransfer);
router.post('/external', authMiddleware, authorize(['CUSTOMER']), controller.executeExternalTransfer);
router.post('/scheduled', authMiddleware, authorize(['CUSTOMER']), controller.executeScheduledTransfer);
router.get('/', authMiddleware, authorize(['CUSTOMER']), controller.getHistory);
router.get('/:id', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.getTransactionDetails);
router.get('/receipt/:id', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.downloadReceipt);

export default router;
