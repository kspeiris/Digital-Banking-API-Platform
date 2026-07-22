import cron from 'node-cron';
import { TransactionRepository } from '../repositories/transaction.repository';
import { TransferService } from './transfer.service';
import { logger } from 'shared-common';
import { prisma } from '../config/database';

export class SchedulerService {
  private transactionRepository: TransactionRepository;
  private transferService: TransferService;
  private cronJob: cron.ScheduledTask | null = null;

  constructor() {
    this.transactionRepository = new TransactionRepository();
    this.transferService = new TransferService();
  }

  start() {
    // Run every minute
    this.cronJob = cron.schedule('* * * * *', async () => {
      logger.info('Scheduler checking for due transfers...');
      try {
        await this.processDueTransfers();
      } catch (err) {
        logger.error('Error processing scheduled transfers', { err });
      }
    });
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
    }
  }

  async processDueTransfers() {
    const dueTransfers = await this.transactionRepository.findDueScheduledTransfers();
    if (dueTransfers.length === 0) {
      return;
    }

    logger.info(`Found ${dueTransfers.length} due scheduled transfers.`);

    for (const transfer of dueTransfers) {
      try {
        // Resolve customer user to execute transfer context
        const sourceAccount = await prisma.account.findUnique({
          where: { id: transfer.fromAccount },
          include: { customer: true },
        });

        if (!sourceAccount) {
          throw new Error('Source account not found');
        }

        const beneficiary = transfer.beneficiary;

        // Determine if internal or external transfer
        const isInternal =
          beneficiary.bankName.toLowerCase() === 'digitalbank' ||
          beneficiary.bankName.toLowerCase() === 'digital banking' ||
          beneficiary.bankName.toLowerCase() === 'digital banking platform';

        let internalDestAccount = null;
        if (isInternal) {
          internalDestAccount = await prisma.account.findUnique({
            where: { accountNumber: beneficiary.accountNumber },
          });
        }

        if (isInternal && internalDestAccount) {
          await this.transferService.executeInternalTransfer(
            sourceAccount.customer.userId,
            {
              fromAccountId: transfer.fromAccount,
              toAccountId: internalDestAccount.id,
              amount: Number(transfer.amount),
              description: transfer.description || 'Scheduled Internal Transfer',
            }
          );
        } else {
          await this.transferService.executeExternalTransfer(
            sourceAccount.customer.userId,
            {
              fromAccountId: transfer.fromAccount,
              beneficiaryId: transfer.beneficiaryId,
              amount: Number(transfer.amount),
              description: transfer.description || 'Scheduled External Transfer',
            }
          );
        }

        // Calculate next execution date based on frequency
        const nextDate = this.calculateNextExecution(transfer.nextExecution, transfer.frequency);

        if (nextDate) {
          await this.transactionRepository.updateScheduledTransferStatus(
            transfer.id,
            'ACTIVE',
            nextDate
          );
        } else {
          await this.transactionRepository.updateScheduledTransferStatus(
            transfer.id,
            'COMPLETED'
          );
        }

        logger.info(`Successfully executed scheduled transfer ${transfer.id}`);
      } catch (err: any) {
        logger.error(`Failed to execute scheduled transfer ${transfer.id}: ${err.message}`, { err });
        // Mark status as FAILED so it doesn't loop forever or block
        await this.transactionRepository.updateScheduledTransferStatus(transfer.id, 'FAILED');
      }
    }
  }

  calculateNextExecution(current: Date, frequency: string): Date | null {
    const next = new Date(current);
    switch (frequency.toUpperCase()) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        return next;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        return next;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        return next;
      case 'ONCE':
      default:
        return null;
    }
  }
}
