import { z } from 'zod';

export const BeneficiaryIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid beneficiary ID format' }),
});

export const AddBeneficiarySchema = z.object({
  nickname: z
    .string()
    .min(1, { message: 'Nickname is required' })
    .max(50, { message: 'Nickname must be less than 50 characters' }),
  accountName: z.string().min(1, { message: 'Account name is required' }),
  accountNumber: z
    .string()
    .regex(/^\d{10,20}$/, { message: 'Account number must be numeric and between 10 and 20 digits' }),
  bankName: z.string().min(1, { message: 'Bank name is required' }),
  branch: z.string().min(1, { message: 'Branch is required' }),
  favorite: z.boolean().default(false),
});

export const UpdateBeneficiarySchema = z.object({
  nickname: z
    .string()
    .min(1, { message: 'Nickname cannot be empty' })
    .max(50, { message: 'Nickname must be less than 50 characters' })
    .optional(),
  branch: z.string().min(1, { message: 'Branch cannot be empty' }).optional(),
  favorite: z.boolean().optional(),
});
