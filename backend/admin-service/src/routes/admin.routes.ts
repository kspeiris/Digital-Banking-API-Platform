import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware } from 'shared-common';
import { authorize } from '../middleware/authorize';

const router = Router();
const adminController = new AdminController();
const reportController = new ReportController();

router.get('/dashboard', authMiddleware, authorize(['ADMIN']), adminController.getDashboardSummary);
router.get('/customers', authMiddleware, authorize(['ADMIN']), adminController.searchCustomers);
router.put('/customer/freeze', authMiddleware, authorize(['ADMIN']), adminController.freezeCustomer);
router.get('/reports', authMiddleware, authorize(['ADMIN']), reportController.generateReport);
router.get('/audit', authMiddleware, authorize(['ADMIN']), adminController.getAuditHistory);

export default router;
