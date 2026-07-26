import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from 'shared-common';

const router = Router();
const controller = new AuthController();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', authMiddleware, controller.logout);
router.post('/refresh', controller.refresh);
router.post('/forgot-password', controller.forgotPassword);
router.post('/verify-otp', controller.verifyOtp);
router.post('/reset-password', controller.resetPassword);
router.get('/profile', authMiddleware, controller.profile);
router.post('/change-password', authMiddleware, controller.changePassword);

export default router;
