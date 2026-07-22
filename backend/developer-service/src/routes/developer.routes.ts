import { Router } from 'express';
import { DeveloperController } from '../controllers/developer.controller';
import { authMiddleware } from 'shared-common';
import { authorize } from '../middleware/authorize';

const router = Router();
const controller = new DeveloperController();

router.get('/apis', authMiddleware, authorize(['DEVELOPER']), controller.getApis);
router.post('/key', authMiddleware, authorize(['DEVELOPER']), controller.generateApiKey);
router.delete('/key', authMiddleware, authorize(['DEVELOPER']), controller.revokeApiKey);
router.get('/analytics', authMiddleware, authorize(['DEVELOPER']), controller.getAnalytics);

export default router;
