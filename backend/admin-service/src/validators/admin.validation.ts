import { z } from 'zod';

export const FreezeCustomerSchema = z.object({
  customerId: z.string().uuid({ message: 'Invalid customer ID format' }),
  reason: z.string().min(1, { message: 'Reason is required' }),
});

export const SearchQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Page must be a positive integer' }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Limit must be a positive integer' }),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'LOCKED', 'SUSPENDED'], { message: 'Invalid status' }).optional(),
  kyc: z.string().optional(),
});

export const ReportsQuerySchema = z.object({
  type: z.enum(['transactions', 'customers', 'loans', 'revenue', 'fraud', 'cards', 'api'], {
    message: 'Unsupported report type',
  }),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Invalid from date format (YYYY-MM-DD)' })
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Invalid to date format (YYYY-MM-DD)' })
    .optional(),
  format: z.enum(['pdf', 'csv', 'excel'], {
    message: 'Unsupported format type',
  }),
});
