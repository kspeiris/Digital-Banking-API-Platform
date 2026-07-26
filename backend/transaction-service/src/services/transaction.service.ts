import { TransactionRepository } from '../repositories/transaction.repository';
import { NotFoundException, ForbiddenException, BadRequestException } from 'shared-common';
import { TransactionType, TransactionStatus } from '@prisma/client';
import { prisma } from '../config/database';

export class TransactionService {
  private transactionRepository: TransactionRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
  }

  async getHistory(
    userId: string,
    filters: {
      page: number;
      limit: number;
      type?: TransactionType;
      status?: TransactionStatus;
      from?: string;
      to?: string;
    }
  ) {
    const customer = await this.transactionRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    const fromDate = filters.from ? new Date(filters.from + 'T00:00:00.000Z') : undefined;
    const toDate = filters.to ? new Date(filters.to + 'T23:59:59.999Z') : undefined;

    const { transactions, total } = await this.transactionRepository.findTransactions(
      customer.id,
      {
        page: filters.page,
        limit: filters.limit,
        type: filters.type,
        status: filters.status,
        from: fromDate,
        to: toDate,
      }
    );

    const data = transactions.map((tx) => ({
      reference: tx.transactionReference,
      amount: Number(tx.amount),
      status: tx.status,
      type: tx.transactionType,
      date: tx.createdAt.toISOString().split('T')[0],
    }));

    return {
      data,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async getTransactionDetails(id: string, userId: string, role: string) {
    const tx = await this.transactionRepository.findTransactionById(id);
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    if (role?.toUpperCase() !== 'ADMIN') {
      const customer = await this.transactionRepository.findCustomerByUserId(userId);
      if (!customer) {
        throw new ForbiddenException('Customer profile not found');
      }

      const isSender = tx.fromAccount && tx.fromAccount.customerId === customer.id;
      const isReceiver = tx.toAccount && tx.toAccount.customerId === customer.id;

      if (!isSender && !isReceiver) {
        throw new ForbiddenException('You do not have permission to access this transaction');
      }
    }

    return {
      reference: tx.transactionReference,
      senderAccount: tx.fromAccount ? tx.fromAccount.accountNumber : null,
      receiverAccount: tx.toAccount
        ? tx.toAccount.accountNumber
        : tx.beneficiary
        ? tx.beneficiary.accountNumber
        : null,
      amount: Number(tx.amount),
      fee: Number(tx.fee),
      status: tx.status,
      createdAt: tx.createdAt.toISOString().split('T')[0],
      description: tx.description,
      type: tx.transactionType,
    };
  }

  async cancelTransaction(id: string, userId: string, role: string) {
    const tx = await this.transactionRepository.findTransactionById(id);
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    if (tx.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Only pending transactions can be cancelled');
    }

    if (role?.toUpperCase() !== 'ADMIN') {
      const customer = await this.transactionRepository.findCustomerByUserId(userId);
      if (!customer) {
        throw new ForbiddenException('Customer profile not found');
      }

      const isSender = tx.fromAccount && tx.fromAccount.customerId === customer.id;
      if (!isSender) {
        throw new ForbiddenException('You can only cancel your own pending transactions');
      }

      const created = new Date(tx.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - created.getTime();
      const diffMins = diffMs / (1000 * 60);
      if (diffMins > 5) {
        throw new BadRequestException('Pending transactions can only be cancelled within 5 minutes of creation');
      }
    }

    await prisma.$transaction(async (txPrisma) => {
      await txPrisma.transaction.update({
        where: { id: tx.id },
        data: { status: TransactionStatus.FAILED },
      });

      if (tx.fromAccountId) {
        await txPrisma.account.update({
          where: { id: tx.fromAccountId },
          data: {
            balance: { increment: tx.amount },
            availableBalance: { increment: tx.amount },
          },
        });
      }

      const targetUserId = tx.toAccount?.customer?.userId || tx.fromAccount?.customer?.userId;
      if (targetUserId) {
        await txPrisma.notification.create({
          data: {
            userId: targetUserId,
            title: 'Transaction Cancelled',
            message: `Transaction ${tx.transactionReference} has been cancelled.`,
          },
        });

        await txPrisma.auditLog.create({
          data: {
            userId: targetUserId,
            action: 'TRANSACTION_CANCEL',
            module: 'TRANSACTION',
          },
        });
      }
    });

    return { success: true, message: 'Transaction cancelled successfully' };
  }

  async disputeTransaction(id: string, userId: string, reason: string) {
    const transaction = await this.transactionRepository.findTransactionById(id);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.SUCCESS) {
      throw new BadRequestException('Only successful transactions can be disputed');
    }

    const customer = await this.transactionRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    const isSender = transaction.fromAccount && transaction.fromAccount.customerId === customer.id;
    const isReceiver = transaction.toAccount && transaction.toAccount.customerId === customer.id;
    if (!isSender && !isReceiver) {
      throw new ForbiddenException('You can only dispute your own transactions');
    }

    await prisma.$transaction(async (txPrisma) => {
      await txPrisma.transaction.update({
        where: { id },
        data: { status: TransactionStatus.FAILED },
      });

      await txPrisma.notification.create({
        data: {
          userId: customer.userId,
          title: 'Transaction Disputed',
          message: `Your dispute for transaction ${transaction.transactionReference} has been submitted. Reason: ${reason}`,
        },
      });

      await txPrisma.auditLog.create({
        data: {
          userId: customer.userId,
          action: 'TRANSACTION_DISPUTE',
          module: 'TRANSACTION',
        },
      });
    });

    return { success: true, message: 'Transaction dispute submitted successfully' };
  }
}
