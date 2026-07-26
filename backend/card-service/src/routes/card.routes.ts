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
router.post('/', authMiddleware, authorize(['ADMIN']), controller.createCard);
router.delete('/:id', authMiddleware, authorize(['ADMIN']), controller.deleteCard);
router.post('/request', authMiddleware, authorize(['CUSTOMER']), controller.requestCard);
router.get('/requests', authMiddleware, authorize(['CUSTOMER']), controller.getCardRequests);
router.get('/admin/requests', authMiddleware, authorize(['ADMIN']), controller.listAllCardRequests);
router.put('/admin/requests/:id/approve', authMiddleware, authorize(['ADMIN']), controller.approveCardRequest);
router.put('/admin/requests/:id/reject', authMiddleware, authorize(['ADMIN']), controller.rejectCardRequest);

export default router;
