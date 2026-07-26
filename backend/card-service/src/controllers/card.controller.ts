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
  CreateCardSchema,
  DeleteCardSchema,
  RequestCardSchema,
  CardRequestIdParamSchema,
  RejectCardRequestSchema,
} from '../validators/card.validation';
import { UnauthorizedException, ForbiddenException, BadRequestException } from 'shared-common';

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

  createCard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      if (req.user.role?.toUpperCase() !== 'ADMIN') {
        throw new ForbiddenException('Only admins can create cards');
      }

      const bodyResult = CreateCardSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      const card = await this.cardService.createCard({
        accountId: bodyResult.data.accountId,
        cardNumber: bodyResult.data.cardNumber,
        cardType: bodyResult.data.cardType,
        expiry: bodyResult.data.expiry,
        pin: bodyResult.data.pin,
        onlineEnabled: bodyResult.data.onlineEnabled,
        internationalEnabled: bodyResult.data.internationalEnabled,
      });

      res.status(201).json({
        success: true,
        data: this.cardService.mapCardResponse(card),
        message: 'Card created successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  deleteCard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      if (req.user.role?.toUpperCase() !== 'ADMIN') {
        throw new ForbiddenException('Only admins can delete cards');
      }

      const paramResult = DeleteCardSchema.safeParse(req.params);
      if (!paramResult.success) {
        throw paramResult.error;
      }

      await this.cardService.deleteCard(paramResult.data.id);

      res.json({
        success: true,
        message: 'Card deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  requestCard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = RequestCardSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      const result = await this.cardService.requestCard(req.user.id, bodyResult.data.accountId);

      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getCardRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const status = req.query.status as string | undefined;
      const requests = await this.cardService.getCardRequests(req.user.id, status as any);

      res.json({
        success: true,
        data: requests,
      });
    } catch (err) {
      next(err);
    }
  };

  approveCardRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      if (req.user.role?.toUpperCase() !== 'ADMIN') {
        throw new ForbiddenException('Only admins can approve card requests');
      }

      const paramResult = CardRequestIdParamSchema.safeParse(req.params);
      if (!paramResult.success) {
        throw paramResult.error;
      }

      const result = await this.cardService.approveCardRequest(paramResult.data.id, req.user.id);

      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  rejectCardRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      if (req.user.role?.toUpperCase() !== 'ADMIN') {
        throw new ForbiddenException('Only admins can reject card requests');
      }

      const paramResult = CardRequestIdParamSchema.safeParse(req.params);
      if (!paramResult.success) {
        throw paramResult.error;
      }

      const bodyResult = RejectCardRequestSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      const result = await this.cardService.rejectCardRequest(paramResult.data.id, req.user.id, bodyResult.data.reason);

      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  listAllCardRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      if (req.user.role?.toUpperCase() !== 'ADMIN') {
        throw new ForbiddenException('Only admins can view all card requests');
      }

      const status = req.query.status as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await this.cardService.getAllCardRequests(status as any, page, limit);

      res.json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
