import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { authMiddleware } from 'shared-common';
import { authorize } from '../middleware/authorize';

const router = Router();
const controller = new AccountController();

router.get('/', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.getAccounts);
router.post('/', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.createAccount);
router.get('/:id', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.getAccountDetails);
router.put('/:id', authMiddleware, authorize(['ADMIN']), controller.updateAccountStatus);
router.delete('/:id', authMiddleware, authorize(['ADMIN']), controller.deleteAccount);
router.get('/:id/balance', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.getAccountBalance);
router.get('/:id/statements', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.getAccountStatements);

export default router;