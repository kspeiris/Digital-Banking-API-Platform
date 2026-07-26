import { z } from 'zod';

export const FreezeCardSchema = z.object({
  cardId: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid card ID format' }),
  reason: z.string().max(255).optional(),
});

export const UnfreezeCardSchema = z.object({
  cardId: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid card ID format' }),
});

export const ChangePinSchema = z.object({
  cardId: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid card ID format' }),
  currentPin: z.string().regex(/^\d{4}$/, { message: 'PIN must be exactly 4 digits' }),
  newPin: z.string().regex(/^\d{4}$/, { message: 'PIN must be exactly 4 digits' }),
  confirmPin: z.string().regex(/^\d{4}$/, { message: 'PIN must be exactly 4 digits' }),
}).refine(
  (data) => data.newPin === data.confirmPin,
  {
    message: 'New PIN and confirmation PIN must match',
    path: ['confirmPin'],
  }
).refine(
  (data) => data.newPin !== data.currentPin,
  {
    message: 'New PIN must be different from current PIN',
    path: ['newPin'],
  }
);

export const UpdateLimitsSchema = z.object({
  cardId: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid card ID format' }),
  dailyLimit: z.number().nonnegative({ message: 'Limit must be a positive number' }),
  atmLimit: z.number().nonnegative({ message: 'Limit must be a positive number' }),
  onlineLimit: z.number().nonnegative({ message: 'Limit must be a positive number' }),
  contactlessLimit: z.number().nonnegative({ message: 'Limit must be a positive number' }),
});

export const UpdateSettingsSchema = z.object({
  cardId: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid card ID format' }),
  onlinePayments: z.boolean(),
  internationalUsage: z.boolean(),
});

export const CreateCardSchema = z.object({
  accountId: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid account ID format' }),
  cardNumber: z.string().regex(/^\d{16}$/, { message: 'Card number must be exactly 16 digits' }),
  cardType: z.enum(['DEBIT', 'CREDIT']),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Expiry must be in MM/YY format' }),
  pin: z.string().regex(/^\d{4}$/, { message: 'PIN must be exactly 4 digits' }),
  onlineEnabled: z.boolean().optional(),
  internationalEnabled: z.boolean().optional(),
});

export const DeleteCardSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid card ID format' }),
});

export const RequestCardSchema = z.object({
  accountId: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid account ID format' }),
});

export const CardRequestIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid card request ID format' }),
});

export const RejectCardRequestSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be at most 500 characters'),
});
