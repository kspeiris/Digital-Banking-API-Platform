import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'shared-common';
import { BeneficiaryService } from '../services/beneficiary.service';
import {
  AddBeneficiarySchema,
  UpdateBeneficiarySchema,
  BeneficiaryIdParamSchema,
} from '../validators/beneficiary.validation';
import { UnauthorizedException } from 'shared-common';

export class BeneficiaryController {
  private beneficiaryService: BeneficiaryService;

  constructor() {
    this.beneficiaryService = new BeneficiaryService();
  }

  getBeneficiaries = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const beneficiaries = await this.beneficiaryService.getBeneficiariesForUser(req.user.id);
      res.json({
        success: true,
        data: beneficiaries,
      });
    } catch (err) {
      next(err);
    }
  };

  addBeneficiary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = AddBeneficiarySchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      await this.beneficiaryService.addBeneficiary(req.user.id, bodyResult.data);
      res.status(201).json({
        success: true,
        message: 'Beneficiary added successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  updateBeneficiary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const paramResult = BeneficiaryIdParamSchema.safeParse(req.params);
      if (!paramResult.success) {
        throw paramResult.error;
      }

      const bodyResult = UpdateBeneficiarySchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      await this.beneficiaryService.updateBeneficiary(
        paramResult.data.id,
        req.user.id,
        bodyResult.data
      );

      res.json({
        success: true,
        message: 'Beneficiary updated successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  deleteBeneficiary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const paramResult = BeneficiaryIdParamSchema.safeParse(req.params);
      if (!paramResult.success) {
        throw paramResult.error;
      }

      await this.beneficiaryService.deleteBeneficiary(paramResult.data.id, req.user.id);
      res.json({
        success: true,
        message: 'Beneficiary deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}
