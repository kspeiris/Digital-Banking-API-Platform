import { Router } from 'express';
import { CardController } from '../controllers/card.controller';
import { authMiddleware } from 'shared-common';
import { authorize } from '../middleware/authorize';

const router = Router();
const controller = new CardController();

router.get('/', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.getCards);
router.put('/freeze', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.freezeCard);
router.put('/unfreeze', authMiddleware, authorize(['CUSTOMER', 'ADMIN']), controller.unfreezeCard);
router.put('/pin', authMiddleware, authorize(['CUSTOMER']), controller.changePin);
router.put('/limit', authMiddleware, authorize(['CUSTOMER']), controller.updateLimits);
router.put('/settings', authMiddleware, authorize(['CUSTOMER']), controller.updateSettings);

export default router;
