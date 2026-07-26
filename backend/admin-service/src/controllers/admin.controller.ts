import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'shared-common';
import { DashboardService } from '../services/dashboard.service';
import { CustomerService } from '../services/customer.service';
import { AuditService } from '../services/audit.service';
import {
  FreezeCustomerSchema,
  SearchQuerySchema,
  UnfreezeCustomerSchema,
  CreateCustomerSchema,
} from '../validators/admin.validation';
import { UnauthorizedException } from 'shared-common';
import { z } from 'zod';

export class AdminController {
  private dashboardService: DashboardService;
  private customerService: CustomerService;
  private auditService: AuditService;

  constructor() {
    this.dashboardService = new DashboardService();
    this.customerService = new CustomerService();
    this.auditService = new AuditService();
  }

  getDashboardSummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const summary = await this.dashboardService.getDashboardSummary();
      res.json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  };

  searchCustomers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const queryResult = SearchQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        throw queryResult.error;
      }

      const result = await this.customerService.searchCustomers(queryResult.data);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  freezeCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = FreezeCustomerSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      await this.customerService.freezeCustomer(
        req.user.id,
        bodyResult.data.customerId,
        bodyResult.data.reason
      );

      res.json({
        success: true,
        message: 'Customer account frozen successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  getAuditHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await this.auditService.getAuditHistory(page, limit);
      res.json({
        success: true,
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  };

  getTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const queryResult = SearchQuerySchema.extend({
        status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REVERSED']).optional(),
        from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      }).safeParse(req.query);

      if (!queryResult.success) {
        throw queryResult.error;
      }

      const result = await this.dashboardService.getTransactions(queryResult.data);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getFraudAlerts = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const alerts = await this.dashboardService.getFraudAlerts();
      res.json({
        success: true,
        data: alerts,
      });
    } catch (err) {
      next(err);
    }
  };

  freezeByUserId = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = z.object({ userId: z.string().uuid(), reason: z.string().min(1) }).safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      await this.customerService.freezeCustomerByUserId(req.user.id, bodyResult.data.userId, bodyResult.data.reason);

      res.json({
        success: true,
        message: 'User account frozen successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  unfreezeByUserId = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = UnfreezeCustomerSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      await this.customerService.unfreezeCustomerByUserId(req.user.id, bodyResult.data.userId, bodyResult.data.reason);

      res.json({
        success: true,
        message: 'User account unfrozen successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  createCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = CreateCustomerSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      const result = await this.customerService.createCustomer(req.user.id, bodyResult.data);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Customer created successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  deleteCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const paramResult = z.object({ customerId: z.string().uuid() }).safeParse(req.params);
      if (!paramResult.success) {
        throw paramResult.error;
      }

      await this.customerService.deleteCustomer(req.user.id, paramResult.data.customerId);

      res.json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}
