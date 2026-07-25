import { z } from 'zod';

export const LoanIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid loan ID format' }),
});

export const ApplyLoanSchema = z.object({
  loanType: z.enum(['PERSONAL', 'HOME', 'VEHICLE', 'EDUCATION'], {
    message: 'Unsupported loan type',
  }),
  requestedAmount: z.number().positive({ message: 'Requested amount must be greater than zero' }),
  durationMonths: z.number().int().positive({ message: 'Duration must be a positive integer' }),
  monthlyIncome: z.number().positive({ message: 'Monthly income is required and must be positive' }),
  employmentType: z.string().min(1, { message: 'Employment type is required' }),
  purpose: z.string().min(1, { message: 'Purpose is required' }),
});

export const UploadDocParamSchema = z.object({
  loanId: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { message: 'Invalid loan ID format' }),
  documentType: z.enum(
    ['NIC_FRONT', 'NIC_BACK', 'SALARY_SLIP', 'BANK_STATEMENT', 'EMPLOYMENT_LETTER'],
    { message: 'Invalid or unsupported document type' }
  ),
});
