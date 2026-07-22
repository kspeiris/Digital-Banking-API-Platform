import { prisma } from '../config/database';
import { LoanStatus } from '@prisma/client';

export class LoanRepository {
  async findCustomerByUserId(userId: string) {
    return prisma.customer.findUnique({
      where: { userId },
    });
  }

  async createLoan(data: {
    customerId: string;
    loanType: string;
    requestedAmount: number;
    interestRate: number;
    durationMonths: number;
    emi: number;
    status: LoanStatus;
  }) {
    return prisma.loan.create({
      data: {
        customerId: data.customerId,
        loanType: data.loanType,
        requestedAmount: data.requestedAmount,
        interestRate: data.interestRate,
        durationMonths: data.durationMonths,
        emi: data.emi,
        status: data.status,
      },
    });
  }

  async findLoansByCustomerId(customerId: string) {
    return prisma.loan.findMany({
      where: { customerId },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  async findAllLoans() {
    return prisma.loan.findMany({
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            nic: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  async findLoanById(id: string) {
    return prisma.loan.findUnique({
      where: { id },
      include: {
        customer: true,
        documents: true,
      },
    });
  }

  async createLoanDocument(data: {
    loanId: string;
    documentType: string;
    fileName: string;
    filePath: string;
  }) {
    return prisma.loanDocument.create({
      data,
    });
  }
}
