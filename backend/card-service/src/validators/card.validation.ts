import { z } from 'zod';

export const FreezeCardSchema = z.object({
  cardId: z.string().uuid({ message: 'Invalid card ID' }),
  reason: z.string().max(255).optional(),
});

export const UnfreezeCardSchema = z.object({
  cardId: z.string().uuid({ message: 'Invalid card ID' }),
});

export const ChangePinSchema = z.object({
  cardId: z.string().uuid({ message: 'Invalid card ID' }),
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
  cardId: z.string().uuid({ message: 'Invalid card ID' }),
  dailyLimit: z.number().nonnegative({ message: 'Limit must be a positive number' }),
  atmLimit: z.number().nonnegative({ message: 'Limit must be a positive number' }),
  onlineLimit: z.number().nonnegative({ message: 'Limit must be a positive number' }),
  contactlessLimit: z.number().nonnegative({ message: 'Limit must be a positive number' }),
});

export const UpdateSettingsSchema = z.object({
  cardId: z.string().uuid({ message: 'Invalid card ID' }),
  onlinePayments: z.boolean(),
  internationalUsage: z.boolean(),
});
