import { z } from 'zod';

export const AccountIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid account ID format' }),
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
      return fromDate <= toDate;
    }
    return true;
  },
  {
    message: 'Invalid statement date range',
    path: ['from'],
  }
);
