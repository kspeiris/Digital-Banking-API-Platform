import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { authMiddleware } from 'shared-common';
import { uploadProfile, uploadKyc } from '../config/storage';

const router = Router();

// Apply auth middleware globally to all customer endpoints
router.use(authMiddleware);

router.get('/me', customerController.getProfile);
router.put('/me', customerController.updateProfile);

router.post(
  '/me/profile-image',
  uploadProfile.single('profileImage'),
  customerController.uploadProfileImage
);

router.post(
  '/kyc',
  uploadKyc.fields([
    { name: 'nicFront', maxCount: 1 },
    { name: 'nicBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
  ]),
  customerController.submitKyc
);

router.get('/:id', customerController.getCustomerById);

export default router;
