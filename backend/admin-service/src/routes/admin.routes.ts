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
router.get('/transactions', authMiddleware, authorize(['ADMIN']), adminController.getTransactions);
router.get('/fraud-alerts', authMiddleware, authorize(['ADMIN']), adminController.getFraudAlerts);
router.put('/customer/freeze-by-user', authMiddleware, authorize(['ADMIN']), adminController.freezeByUserId);
router.put('/customer/unfreeze-by-user', authMiddleware, authorize(['ADMIN']), adminController.unfreezeByUserId);
router.post('/customers', authMiddleware, authorize(['ADMIN']), adminController.createCustomer);
router.delete('/customers/:customerId', authMiddleware, authorize(['ADMIN']), adminController.deleteCustomer);

export default router;
