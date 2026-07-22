import { z } from 'zod';
import { TransactionType, TransactionStatus } from '@prisma/client';

export const TransactionIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid transaction ID format' }),
});

export const InternalTransferSchema = z.object({
  fromAccountId: z.string().uuid({ message: 'Invalid source account ID' }),
  toAccountId: z.string().uuid({ message: 'Invalid destination account ID' }),
  amount: z.number().positive({ message: 'Amount must be greater than 0' }),
  description: z.string().max(255).optional(),
}).refine(
  (data) => data.fromAccountId !== data.toAccountId,
  {
    message: 'Source and destination accounts must be different',
    path: ['toAccountId'],
  }
);

export const ExternalTransferSchema = z.object({
  fromAccountId: z.string().uuid({ message: 'Invalid source account ID' }),
  beneficiaryId: z.string().uuid({ message: 'Invalid beneficiary ID' }),
  amount: z.number().positive({ message: 'Amount must be greater than 0' }),
  description: z.string().max(255).optional(),
});

export const ScheduledTransferSchema = z.object({
  fromAccountId: z.string().uuid({ message: 'Invalid source account ID' }),
  beneficiaryId: z.string().uuid({ message: 'Invalid beneficiary ID' }),
  amount: z.number().positive({ message: 'Amount must be greater than 0' }),
  transferDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'transferDate must be in YYYY-MM-DD format',
  }),
  frequency: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY']),
  description: z.string().max(255).optional(),
}).refine(
  (data) => {
    const transferDate = new Date(data.transferDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transferDate >= today;
  },
  {
    message: 'Transfer date must be today or in the future',
    path: ['transferDate'],
  }
);

export const TransactionQuerySchema = z.object({
  page: z.preprocess((val) => (val ? parseInt(val as string, 10) : 1), z.number().min(1).default(1)),
  limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : 20), z.number().min(1).max(100).default(20)),
  type: z.nativeEnum(TransactionType).optional(),
  status: z.nativeEnum(TransactionStatus).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
