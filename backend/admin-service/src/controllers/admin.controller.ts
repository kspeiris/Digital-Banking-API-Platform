import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'shared-common';
import { DashboardService } from '../services/dashboard.service';
import { CustomerService } from '../services/customer.service';
import { AuditService } from '../services/audit.service';
import {
  FreezeCustomerSchema,
  SearchQuerySchema,
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
        data: result.data,
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
}
