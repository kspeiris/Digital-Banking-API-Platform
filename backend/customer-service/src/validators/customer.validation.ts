import { z } from 'zod';

const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'Max 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Max 50 characters'),
  phone: z.string().regex(phoneRegex, 'Invalid Sri Lankan phone number format'),
  address: z.string().max(255, 'Max 255 characters').optional(),
  city: z.string().max(100, 'Max 100 characters').optional(),
  country: z.string().max(100, 'Max 100 characters').optional(),
  occupation: z.string().max(100, 'Max 100 characters').optional(),
});

export const submitKycSchema = z.object({
  occupation: z.string().min(1, 'Occupation is required').max(100),
  monthlyIncome: z.preprocess((val) => Number(val), z.number().min(0, 'Monthly income must be positive')),
});
