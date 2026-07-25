import { z } from 'zod';

export const DeleteParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid notification ID format' }),
});

export const MarkReadSchema = z.object({
  notificationIds: z.array(z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid notification ID format' })).min(1, {
    message: 'At least one notification ID is required',
  }),
});

export const HistoryQuerySchema = z.object({
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
  type: z.enum(['EMAIL', 'SMS', 'PUSH'], { message: 'Invalid notification type' }).optional(),
  category: z
    .enum(['LOGIN', 'TRANSFER', 'LOAN', 'CARD', 'SECURITY', 'SYSTEM', 'PROMOTION'], {
      message: 'Invalid notification category',
    })
    .optional(),
  read: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});
