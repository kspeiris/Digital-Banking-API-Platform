import { TransactionRepository } from '../repositories/transaction.repository';
import { prisma } from '../config/database';
import { NotFoundException, ForbiddenException, BadRequestException } from 'shared-common';
import { TransactionType, TransactionStatus } from '@prisma/client';

export class TransferService {
  private transactionRepository: TransactionRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
  }

  generateReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    return `TXN${timestamp}${random}`.substring(0, 50);
  }

  async executeInternalTransfer(
    userId: string,
    data: {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      description?: string;
    }
  ) {
    const customer = await this.transactionRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    const sourceAccount = await prisma.account.findUnique({
      where: { id: data.fromAccountId },
      include: { customer: true },
    });
    if (!sourceAccount) {
      throw new NotFoundException('Account not found');
    }

    if (sourceAccount.customerId !== customer.id) {
      throw new ForbiddenException('You do not have permission to access this account');
    }

    if (sourceAccount.status !== 'ACTIVE') {
      throw new BadRequestException('Source account is not active');
    }

    const destAccount = await prisma.account.findUnique({
      where: { id: data.toAccountId },
      include: { customer: true },
    });
    if (!destAccount) {
      throw new NotFoundException('Destination account not found');
    }

    if (destAccount.status !== 'ACTIVE') {
      throw new BadRequestException('Destination account is not active');
    }

    // 1. Balance check
    if (Number(sourceAccount.availableBalance) < data.amount) {
      throw new BadRequestException('Insufficient account balance');
    }

    // 2. Daily limit check (500k limit)
    const spentToday = await this.transactionRepository.getDailySpent(data.fromAccountId, new Date());
    if (spentToday + data.amount > 500000) {
      throw new BadRequestException('Daily transfer limit exceeded');
    }

    // 3. Duplicate check (last 30 seconds)
    const thirtySecsAgo = new Date(Date.now() - 30 * 1000);
    const duplicate = await this.transactionRepository.findDuplicateTransaction({
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: data.amount,
      since: thirtySecsAgo,
    });
    if (duplicate) {
      throw new BadRequestException('Duplicate transaction detected');
    }

    const reference = this.generateReference();

    // 4. PostgreSQL Transaction
    await prisma.$transaction(async (tx) => {
      // Debit Source
      await tx.account.update({
        where: { id: data.fromAccountId },
        data: {
          balance: { decrement: data.amount },
          availableBalance: { decrement: data.amount },
        },
      });

      // Credit Destination
      await tx.account.update({
        where: { id: data.toAccountId },
        data: {
          balance: { increment: data.amount },
          availableBalance: { increment: data.amount },
        },
      });

      // Create Transaction Record
      await tx.transaction.create({
        data: {
          transactionReference: reference,
          fromAccountId: data.fromAccountId,
          toAccountId: data.toAccountId,
          amount: data.amount,
          currency: sourceAccount.currency,
          description: data.description || 'Internal Transfer',
          status: TransactionStatus.SUCCESS,
          transactionType: TransactionType.INTERNAL,
          fee: 0,
        },
      });

      // Notifications
      await tx.notification.create({
        data: {
          userId: sourceAccount.customer.userId,
          title: 'Funds Debited',
          message: `Your account ${sourceAccount.accountNumber} has been debited by ${sourceAccount.currency} ${data.amount.toFixed(2)}.`,
        },
      });

      await tx.notification.create({
        data: {
          userId: destAccount.customer.userId,
          title: 'Funds Credited',
          message: `Your account ${destAccount.accountNumber} has been credited with ${destAccount.currency} ${data.amount.toFixed(2)}.`,
        },
      });

      // Audit Logs
      await tx.auditLog.create({
        data: {
          userId: sourceAccount.customer.userId,
          action: 'TRANSFER_INTERNAL',
          module: 'TRANSACTION',
        },
      });
    });

    return reference;
  }

  async executeExternalTransfer(
    userId: string,
    data: {
      fromAccountId: string;
      beneficiaryId: string;
      amount: number;
      description?: string;
    }
  ) {
    const customer = await this.transactionRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    const sourceAccount = await prisma.account.findUnique({
      where: { id: data.fromAccountId },
      include: { customer: true },
    });
    if (!sourceAccount) {
      throw new NotFoundException('Account not found');
    }

    if (sourceAccount.customerId !== customer.id) {
      throw new ForbiddenException('You do not have permission to access this account');
    }

    if (sourceAccount.status !== 'ACTIVE') {
      throw new BadRequestException('Source account is not active');
    }

    const beneficiary = await this.transactionRepository.findBeneficiaryById(data.beneficiaryId);
    if (!beneficiary || beneficiary.customerId !== customer.id) {
      throw new BadRequestException('Beneficiary not found');
    }

    const fee = 50.0; // Standard external transfer fee
    const totalDeduction = data.amount + fee;

    // 1. Balance check
    if (Number(sourceAccount.availableBalance) < totalDeduction) {
      throw new BadRequestException('Insufficient account balance');
    }

    // 2. Daily limit check
    const spentToday = await this.transactionRepository.getDailySpent(data.fromAccountId, new Date());
    if (spentToday + totalDeduction > 500000) {
      throw new BadRequestException('Daily transfer limit exceeded');
    }

    // 3. Duplicate check
    const thirtySecsAgo = new Date(Date.now() - 30 * 1000);
    const duplicate = await this.transactionRepository.findDuplicateTransaction({
      fromAccountId: data.fromAccountId,
      beneficiaryId: data.beneficiaryId,
      amount: data.amount,
      since: thirtySecsAgo,
    });
    if (duplicate) {
      throw new BadRequestException('Duplicate transaction detected');
    }

    const reference = this.generateReference();

    // 4. PostgreSQL Transaction
    await prisma.$transaction(async (tx) => {
      // Debit Source
      await tx.account.update({
        where: { id: data.fromAccountId },
        data: {
          balance: { decrement: totalDeduction },
          availableBalance: { decrement: totalDeduction },
        },
      });

      // Create Transaction Record
      await tx.transaction.create({
        data: {
          transactionReference: reference,
          fromAccountId: data.fromAccountId,
          beneficiaryId: data.beneficiaryId,
          amount: data.amount,
          currency: sourceAccount.currency,
          description: data.description || 'External Transfer',
          status: TransactionStatus.SUCCESS, // Immediately successful for local simulation
          transactionType: TransactionType.EXTERNAL,
          fee: fee,
        },
      });

      // Notification
      await tx.notification.create({
        data: {
          userId: sourceAccount.customer.userId,
          title: 'External Transfer Placed',
          message: `Your account ${sourceAccount.accountNumber} has been debited by ${sourceAccount.currency} ${totalDeduction.toFixed(2)} (including a ${fee} LKR fee) for external transfer to ${beneficiary.accountName}.`,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: sourceAccount.customer.userId,
          action: 'TRANSFER_EXTERNAL',
          module: 'TRANSACTION',
        },
      });
    });

    return reference;
  }
}
