import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'shared-common';
import { TransferService } from '../services/transfer.service';
import { TransactionService } from '../services/transaction.service';
import { ReceiptService } from '../services/receipt.service';
import { TransactionRepository } from '../repositories/transaction.repository';
import {
  InternalTransferSchema,
  ExternalTransferSchema,
  ScheduledTransferSchema,
  TransactionQuerySchema,
  TransactionIdParamSchema,
} from '../validators/transaction.validation';
import { UnauthorizedException, ForbiddenException, BadRequestException } from 'shared-common';

export class TransactionController {
  private transferService: TransferService;
  private transactionService: TransactionService;
  private receiptService: ReceiptService;
  private transactionRepository: TransactionRepository;

  constructor() {
    this.transferService = new TransferService();
    this.transactionService = new TransactionService();
    this.receiptService = new ReceiptService();
    this.transactionRepository = new TransactionRepository();
  }

  executeInternalTransfer = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = InternalTransferSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      const reference = await this.transferService.executeInternalTransfer(
        req.user.id,
        bodyResult.data
      );

      res.status(201).json({
        success: true,
        transactionReference: reference,
      });
    } catch (err) {
      next(err);
    }
  };

  executeExternalTransfer = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = ExternalTransferSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      const reference = await this.transferService.executeExternalTransfer(
        req.user.id,
        bodyResult.data
      );

      res.status(201).json({
        success: true,
        transactionReference: reference,
      });
    } catch (err) {
      next(err);
    }
  };

  executeScheduledTransfer = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const bodyResult = ScheduledTransferSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw bodyResult.error;
      }

      const customer = await this.transactionRepository.findCustomerByUserId(req.user.id);
      if (!customer) {
        throw new ForbiddenException('Customer profile not found');
      }

      const sourceAccount = await this.transactionRepository.findAccountById(
        bodyResult.data.fromAccountId
      );
      if (!sourceAccount || sourceAccount.customerId !== customer.id) {
        throw new ForbiddenException('You do not have permission to access this account');
      }

      const beneficiary = await this.transactionRepository.findBeneficiaryById(
        bodyResult.data.beneficiaryId
      );
      if (!beneficiary || beneficiary.customerId !== customer.id) {
        throw new BadRequestException('Beneficiary not found');
      }

      const nextExecution = new Date(bodyResult.data.transferDate + 'T00:00:00.000Z');

      await this.transactionRepository.createScheduledTransfer({
        customerId: customer.id,
        fromAccount: bodyResult.data.fromAccountId,
        beneficiaryId: bodyResult.data.beneficiaryId,
        amount: bodyResult.data.amount,
        frequency: bodyResult.data.frequency,
        nextExecution,
        status: 'ACTIVE',
      });

      res.status(201).json({
        success: true,
        message: 'Transfer scheduled successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  getHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const queryResult = TransactionQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        throw queryResult.error;
      }

      const result = await this.transactionService.getHistory(req.user.id, queryResult.data);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getTransactionDetails = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const paramResult = TransactionIdParamSchema.safeParse(req.params);
      if (!paramResult.success) {
        throw paramResult.error;
      }

      const details = await this.transactionService.getTransactionDetails(
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

  downloadReceipt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const paramResult = TransactionIdParamSchema.safeParse(req.params);
      if (!paramResult.success) {
        throw paramResult.error;
      }

      const format = req.query.format === 'json' ? 'json' : 'pdf';

      const details = await this.transactionService.getTransactionDetails(
        paramResult.data.id,
        req.user.id,
        req.user.role
      );

      if (format === 'json') {
        res.json({
          success: true,
          data: details,
        });
        return;
      }

      const buffer = await this.receiptService.generateReceiptPDF(details);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${details.reference}.pdf"`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };
}
