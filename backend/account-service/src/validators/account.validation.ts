import { z } from 'zod';

export const AccountIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid account ID format' }),
});

export const StatementQuerySchema = z.object({
  from: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'from date must be YYYY-MM-DD' })
    .optional(),
  to: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'to date must be YYYY-MM-DD' })
    .optional(),
  page: z.preprocess((val) => (val ? parseInt(val as string, 10) : 1), z.number().min(1).default(1)),
  limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : 20), z.number().min(1).max(100).default(20)),
  format: z.enum(['json', 'pdf', 'excel']).default('json'),
}).refine(
  (data) => {
    if (data.from && data.to) {
      const fromDate = new Date(data.from);
      const toDate = new Date(data.to);
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return false;
      }
      return fromDate <= toDate;
    }
    return true;
  },
  {
    message: 'Invalid statement date range',
    path: ['from'],
  }
);

export const CreateAccountSchema = z.object({
  accountNumber: z.string()
    .min(6, { message: 'Account number must be at least 6 characters' })
    .max(30, { message: 'Account number must be at most 30 characters' })
    .regex(/^[0-9a-zA-Z-]+$/, { message: 'Account number must contain only alphanumeric characters and hyphens' }),
  accountType: z.string()
    .min(1, { message: 'Account type is required' })
    .max(50, { message: 'Account type must be at most 50 characters' }),
  currency: z.string()
    .length(3, { message: 'Currency must be a 3-letter code' })
    .regex(/^[A-Z]{3}$/, { message: 'Currency must be a valid ISO 4217 code' }),
  branch: z.string()
    .min(1, { message: 'Branch is required' })
    .max(100, { message: 'Branch must be at most 100 characters' }),
  initialBalance: z.number()
    .min(0, { message: 'Initial balance must be zero or positive' })
    .max(999999999999.99, { message: 'Initial balance exceeds maximum allowed value' }),
  customerId: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid customer ID format' }).optional(),
});

export const UpdateAccountStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'FROZEN', 'CLOSED'], { message: 'Status must be ACTIVE, FROZEN, or CLOSED' }),
});