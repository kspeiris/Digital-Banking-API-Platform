import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'shared-common';
import { CardService } from '../services/card.service';
import { LimitService } from '../services/limit.service';
import {
  FreezeCardSchema,
  UnfreezeCardSchema,
  ChangePinSchema,
  UpdateLimitsSchema,
  UpdateSettingsSchema,
} from '../validators/card.validation';
import { UnauthorizedException } from 'shared-common';

export class CardController {
  private cardService: CardService;
  private limitService: LimitService;

  constructor() {
    this.cardService = new CardService();
    this.limitService = new LimitService();
  }

  getCards = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const cards = await this.cardService.getCardsForUser(req.user.id, req.user.role);
      res.json({
        success: true,
        data: cards,
      });
    } catch (err) {
      next(err);
    }
  };

  freezeCard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = FreezeCardSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      await this.cardService.freezeCard(
        bodyResult.data.cardId,
        req.user.id,
        req.user.role,
        bodyResult.data.reason
      );

      res.json({
        success: true,
        message: 'Card frozen successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  unfreezeCard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = UnfreezeCardSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      await this.cardService.unfreezeCard(
        bodyResult.data.cardId,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        message: 'Card reactivated successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  changePin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = ChangePinSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      await this.cardService.changePin(
        bodyResult.data.cardId,
        req.user.id,
        req.user.role,
        bodyResult.data.currentPin,
        bodyResult.data.newPin
      );

      res.json({
        success: true,
        message: 'PIN updated successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  updateLimits = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = UpdateLimitsSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      // Verify access first
      await this.cardService.verifyCardAccess(bodyResult.data.cardId, req.user.id, req.user.role);

      await this.limitService.updateLimits(bodyResult.data.cardId, bodyResult.data);

      res.json({
        success: true,
        message: 'Card limits updated successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  updateSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = UpdateSettingsSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      await this.cardService.updateSettings(
        bodyResult.data.cardId,
        req.user.id,
        req.user.role,
        bodyResult.data.onlinePayments,
        bodyResult.data.internationalUsage
      );

      res.json({
        success: true,
        message: 'Card settings updated successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}
