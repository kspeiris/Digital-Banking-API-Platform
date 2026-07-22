import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'shared-common';
import { LoanService } from '../services/loan.service';
import {
  ApplyLoanSchema,
  UploadDocParamSchema,
  LoanIdParamSchema,
} from '../validators/loan.validation';
import { UnauthorizedException, BadRequestException } from 'shared-common';

export class LoanController {
  private loanService: LoanService;

  constructor() {
    this.loanService = new LoanService();
  }

  applyForLoan = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = ApplyLoanSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      const result = await this.loanService.applyForLoan(req.user.id, bodyResult.data);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  getHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const loans = await this.loanService.getHistory(req.user.id, req.user.role);
      res.json({
        success: true,
        data: loans,
      });
    } catch (err) {
      next(err);
    }
  };

  getLoanDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const paramResult = LoanIdParamSchema.safeParse(req.params);
      if (!paramResult.success) {
        throw paramResult.error;
      }

      const details = await this.loanService.getLoanDetails(
        paramResult.data.id,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: details,
      });
    } catch (err) {
      next(err);
    }
  };

  getLoanStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const paramResult = LoanIdParamSchema.safeParse(req.params);
      if (!paramResult.success) {
        throw paramResult.error;
      }

      const status = await this.loanService.getLoanStatus(
        paramResult.data.id,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        status,
      });
    } catch (err) {
      next(err);
    }
  };

  uploadDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      if (!req.file) {
        throw new BadRequestException('Document file is required');
      }

      const bodyResult = UploadDocParamSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      await this.loanService.uploadDocument(
        bodyResult.data.loanId,
        req.user.id,
        bodyResult.data.documentType,
        {
          filename: req.file.filename,
          path: req.file.path,
        }
      );

      res.json({
        success: true,
        message: 'Document uploaded successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}
