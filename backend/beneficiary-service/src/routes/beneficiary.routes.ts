import { Router } from 'express';
import { BeneficiaryController } from '../controllers/beneficiary.controller';
import { authMiddleware } from 'shared-common';
import { authorize } from '../middleware/authorize';

const router = Router();
const controller = new BeneficiaryController();

router.get('/', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.getBeneficiaries);
router.post('/', authMiddleware, authorize(['CUSTOMER']), controller.addBeneficiary);
router.put('/:id', authMiddleware, authorize(['CUSTOMER']), controller.updateBeneficiary);
router.delete('/:id', authMiddleware, authorize(['CUSTOMER']), controller.deleteBeneficiary);

export default router;
