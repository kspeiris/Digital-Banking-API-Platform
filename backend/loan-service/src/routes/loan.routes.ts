import { Router } from 'express';
import { LoanController } from '../controllers/loan.controller';
import { authMiddleware } from 'shared-common';
import { authorize } from '../middleware/authorize';
import { upload } from '../config/storage';

const router = Router();
const controller = new LoanController();

router.post('/', authMiddleware, authorize(['CUSTOMER']), controller.applyForLoan);
router.get('/', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.getHistory);
router.get('/:id', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.getLoanDetails);
router.get('/status/:id', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.getLoanStatus);
router.put('/:id/approve', authMiddleware, authorize(['ADMIN']), controller.approveLoan);
router.put('/:id/reject', authMiddleware, authorize(['ADMIN']), controller.rejectLoan);
router.delete('/:id', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.cancelLoan);
router.post(
  '/upload',
  authMiddleware,
  authorize(['CUSTOMER']),
  upload.single('file'),
  controller.uploadDocument
);

export default router;
