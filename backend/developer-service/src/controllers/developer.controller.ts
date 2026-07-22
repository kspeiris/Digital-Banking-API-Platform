import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'shared-common';
import { DeveloperService } from '../services/developer.service';
import { AnalyticsService } from '../services/analytics.service';
import {
  GenerateKeySchema,
  RevokeKeySchema,
} from '../validators/developer.validation';
import { UnauthorizedException } from 'shared-common';

export class DeveloperController {
  private developerService: DeveloperService;
  private analyticsService: AnalyticsService;

  constructor() {
    this.developerService = new DeveloperService();
    this.analyticsService = new AnalyticsService();
  }

  getApis = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const apis = await this.developerService.getApis();
      res.json({
        success: true,
        data: apis,
      });
    } catch (err) {
      next(err);
    }
  };

  generateApiKey = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = GenerateKeySchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      const result = await this.developerService.generateApiKey(
        req.user.id,
        bodyResult.data.applicationName
      );

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  revokeApiKey = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = RevokeKeySchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      await this.developerService.revokeApiKey(req.user.id, bodyResult.data.apiKey);

      res.json({
        success: true,
        message: 'API key revoked successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  getAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const analytics = await this.analyticsService.getAnalyticsSummary(req.user.id);
      res.json({
        success: true,
        data: analytics,
      });
    } catch (err) {
      next(err);
    }
  };
}
