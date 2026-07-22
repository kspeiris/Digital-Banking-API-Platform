import { TransactionRepository } from '../repositories/transaction.repository';
import { NotFoundException, ForbiddenException } from 'shared-common';
import { TransactionType, TransactionStatus } from '@prisma/client';

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

    if (role !== 'ADMIN') {
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
}
