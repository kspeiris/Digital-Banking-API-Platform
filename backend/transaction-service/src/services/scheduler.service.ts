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
      let retries = 0;
      const maxRetries = 3;
      let success = false;

      while (!success && retries < maxRetries) {
        try {
          const sourceAccount = await prisma.account.findUnique({
            where: { id: transfer.fromAccount },
            include: { customer: true },
          });

          if (!sourceAccount) {
            throw new Error('Source account not found');
          }

          const beneficiary = transfer.beneficiary;

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
                description: 'Scheduled Internal Transfer',
              }
            );
          } else {
            await this.transferService.executeExternalTransfer(
              sourceAccount.customer.userId,
              {
                fromAccountId: transfer.fromAccount,
                beneficiaryId: transfer.beneficiaryId,
                amount: Number(transfer.amount),
                description: 'Scheduled External Transfer',
              }
            );
          }

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
          success = true;
        } catch (err: any) {
          retries++;
          if (retries >= maxRetries) {
            logger.error(`Failed to execute scheduled transfer ${transfer.id} after ${maxRetries} attempts: ${err.message}`, { err });
            await this.transactionRepository.updateScheduledTransferStatus(transfer.id, 'FAILED');
          } else {
            logger.warn(`Retry ${retries}/${maxRetries} for scheduled transfer ${transfer.id}: ${err.message}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        }
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
