import { z } from 'zod';

export const GenerateKeySchema = z.object({
  applicationName: z
    .string()
    .min(1, { message: 'Application name is required' })
    .max(100, { message: 'Application name cannot exceed 100 characters' }),
});

export const RevokeKeySchema = z.object({
  apiKey: z
    .string()
    .min(1, { message: 'API key is required' })
    .refine((val) => val.startsWith('pk_live_'), { message: 'Invalid API key format' }),
});
