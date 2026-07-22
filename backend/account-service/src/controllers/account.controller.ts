import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'shared-common';
import { AccountService } from '../services/account.service';
import { StatementService } from '../services/statement.service';
import { AccountIdParamSchema, StatementQuerySchema } from '../validators/account.validation';
import { BadRequestException, UnauthorizedException } from 'shared-common';

export class AccountController {
  private accountService: AccountService;
  private statementService: StatementService;

  constructor() {
    this.accountService = new AccountService();
    this.statementService = new StatementService();
  }

  getAccounts = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const accounts = await this.accountService.getAccountsForUser(req.user.id, req.user.role);
      res.json({
        success: true,
        data: accounts,
      });
    } catch (err) {
      next(err);
    }
  };

  getAccountDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const paramResult = AccountIdParamSchema.safeParse(req.params);
      if (!paramResult.success) {
        throw paramResult.error;
      }

      const details = await this.accountService.getAccountDetails(
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

  getAccountBalance = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const paramResult = AccountIdParamSchema.safeParse(req.params);
      if (!paramResult.success) {
        throw paramResult.error;
      }

      const balance = await this.accountService.getAccountBalance(
        paramResult.data.id,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: balance,
      });
    } catch (err) {
      next(err);
    }
  };

  getAccountStatements = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const paramResult = AccountIdParamSchema.safeParse(req.params);
      if (!paramResult.success) {
        throw paramResult.error;
      }

      const queryResult = StatementQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        const hasDateError = queryResult.error.issues.some(
          (issue) => issue.message === 'Invalid statement date range'
        );
        if (hasDateError) {
          throw new BadRequestException('Invalid statement date range');
        }
        throw queryResult.error;
      }

      const { from, to, page, limit, format } = queryResult.data;
      const { account, fromDateIso, toDateIso, startBalance, transactions } =
        await this.statementService.getStatementData(
          paramResult.data.id,
          req.user.id,
          req.user.role,
          from,
          to
        );

      if (format === 'json') {
        const total = transactions.length;
        const paginated = transactions.slice((page - 1) * limit, page * limit);
        res.json({
          success: true,
          data: {
            accountNumber: account.accountNumber,
            fromDate: fromDateIso,
            toDate: toDateIso,
            transactions: paginated,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
            },
          },
        });
        return;
      }

      if (format === 'pdf') {
        const buffer = await this.statementService.generatePDF(
          account,
          fromDateIso,
          toDateIso,
          transactions,
          startBalance
        );
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="statement-${account.accountNumber}.pdf"`
        );
        res.send(buffer);
        return;
      }

      if (format === 'excel') {
        const buffer = await this.statementService.generateExcel(
          account,
          fromDateIso,
          toDateIso,
          transactions,
          startBalance
        );
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="statement-${account.accountNumber}.xlsx"`
        );
        res.send(buffer);
        return;
      }

      throw new BadRequestException('Unsupported format');
    } catch (err) {
      next(err);
    }
  };
}
