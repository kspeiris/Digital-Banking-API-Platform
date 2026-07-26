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

export const UnfreezeCustomerSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
  reason: z.string().optional(),
});

export const CreateCustomerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(9, 'Invalid phone number'),
  nic: z.string().min(10, 'Invalid NIC format'),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date of birth format',
  }),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});
