import { LoanRepository } from '../repositories/loan.repository';
import { CalculatorService } from './calculator.service';
import { NotFoundException, ForbiddenException, BadRequestException } from 'shared-common';
import { LoanStatus } from '@prisma/client';
import { prisma } from '../config/database';

export class LoanService {
  private loanRepository: LoanRepository;
  private calculatorService: CalculatorService;

  constructor() {
    this.loanRepository = new LoanRepository();
    this.calculatorService = new CalculatorService();
  }

  async applyForLoan(
    userId: string,
    data: {
      loanType: string;
      requestedAmount: number;
      durationMonths: number;
      monthlyIncome: number;
      employmentType: string;
      purpose: string;
    }
  ) {
    const customer = await this.loanRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    const { emi, interestRate } = this.calculatorService.calculateEMI(
      data.requestedAmount,
      data.loanType,
      data.durationMonths
    );

    const loan = await prisma.$transaction(async (tx) => {
      const createdLoan = await tx.loan.create({
        data: {
          customerId: customer.id,
          loanType: data.loanType.toUpperCase(),
          requestedAmount: data.requestedAmount,
          interestRate,
          durationMonths: data.durationMonths,
          emi,
          status: LoanStatus.SUBMITTED,
        },
      });

      // Notification
      await tx.notification.create({
        data: {
          userId: customer.userId,
          title: 'Loan Application Submitted',
          message: `Your application for a ${data.loanType.toUpperCase()} loan of ${data.requestedAmount.toFixed(2)} LKR has been submitted successfully.`,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: customer.userId,
          action: 'LOAN_APPLICATION_SUBMIT',
          module: 'LOAN',
        },
      });

      return createdLoan;
    });

    return {
      success: true,
      loanId: loan.id,
      status: loan.status,
    };
  }

  async getHistory(userId: string, role: string) {
    if (role?.toUpperCase() === 'ADMIN') {
      const loans = await this.loanRepository.findAllLoans();
      return loans.map((l) => ({
        loanId: l.id,
        loanType: l.loanType,
        requestedAmount: Number(l.requestedAmount),
        approvedAmount: l.approvedAmount ? Number(l.approvedAmount) : 0,
        interestRate: Number(l.interestRate),
        durationMonths: l.durationMonths,
        status: l.status,
        submittedAt: l.submittedAt.toISOString().split('T')[0],
        customer: l.customer ? {
          firstName: l.customer.firstName,
          lastName: l.customer.lastName,
          nic: l.customer.nic,
        } : null,
      }));
    }

    const customer = await this.loanRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    const loans = await this.loanRepository.findLoansByCustomerId(customer.id);
    return loans.map((l) => ({
      loanId: l.id,
      loanType: l.loanType,
      requestedAmount: Number(l.requestedAmount),
      status: l.status,
      submittedAt: l.submittedAt.toISOString().split('T')[0],
    }));
  }

  async getLoanDetails(loanId: string, userId: string, role: string) {
    const loan = await this.loanRepository.findLoanById(loanId);
    if (!loan) {
      throw new NotFoundException('Loan application not found');
    }

    if (role?.toUpperCase() !== 'ADMIN') {
      const customer = await this.loanRepository.findCustomerByUserId(userId);
      if (!customer || loan.customerId !== customer.id) {
        throw new ForbiddenException('You do not have permission to access this loan');
      }
    }

    return {
      loanId: loan.id,
      loanType: loan.loanType,
      requestedAmount: Number(loan.requestedAmount),
      approvedAmount: Number(loan.approvedAmount),
      interestRate: Number(loan.interestRate),
      durationMonths: loan.durationMonths,
      emi: Number(loan.emi),
      status: loan.status,
    };
  }

  async getLoanStatus(loanId: string, userId: string, role: string) {
    const loan = await this.loanRepository.findLoanById(loanId);
    if (!loan) {
      throw new NotFoundException('Loan application not found');
    }

    if (role?.toUpperCase() !== 'ADMIN') {
      const customer = await this.loanRepository.findCustomerByUserId(userId);
      if (!customer || loan.customerId !== customer.id) {
        throw new ForbiddenException('You do not have permission to access this loan');
      }
    }

    return loan.status;
  }

  async uploadDocument(
    loanId: string,
    userId: string,
    documentType: string,
    file: { filename: string; path: string }
  ) {
    const customer = await this.loanRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    const loan = await this.loanRepository.findLoanById(loanId);
    if (!loan) {
      throw new NotFoundException('Loan application not found');
    }

    if (loan.customerId !== customer.id) {
      throw new ForbiddenException('You do not have permission to access this loan');
    }

    await prisma.$transaction(async (tx) => {
      await tx.loanDocument.create({
        data: {
          loanId,
          documentType,
          fileName: file.filename,
          filePath: file.path,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: customer.userId,
          action: `LOAN_DOCUMENT_UPLOAD_${documentType}`,
          module: 'LOAN',
        },
      });
    });
  }

  async approveLoan(loanId: string, approvedAmount: number, interestRate: number) {
    const loan = await this.loanRepository.findLoanById(loanId);
    if (!loan) {
      throw new NotFoundException('Loan application not found');
    }

    if (loan.status !== LoanStatus.SUBMITTED && loan.status !== LoanStatus.UNDER_REVIEW) {
      throw new BadRequestException('Only submitted or under-review loans can be approved');
    }

    if (approvedAmount <= 0 || approvedAmount > Number(loan.requestedAmount)) {
      throw new BadRequestException('Approved amount must be greater than 0 and not exceed requested amount');
    }

    const updatedLoan = await this.loanRepository.updateLoanStatus(loanId, LoanStatus.APPROVED, approvedAmount, interestRate);

    await prisma.notification.create({
      data: {
        userId: loan.customer.userId,
        title: 'Loan Approved',
        message: `Your ${loan.loanType.toLowerCase()} loan application has been approved for ${approvedAmount.toFixed(2)} LKR.`,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: loan.customer.userId,
        action: 'LOAN_APPROVED',
        module: 'LOAN',
      },
    });

    return {
      loanId: updatedLoan.id,
      status: updatedLoan.status,
      approvedAmount: Number(updatedLoan.approvedAmount),
      interestRate: Number(updatedLoan.interestRate),
    };
  }

  async rejectLoan(loanId: string, reason?: string) {
    const loan = await this.loanRepository.findLoanById(loanId);
    if (!loan) {
      throw new NotFoundException('Loan application not found');
    }

    if (loan.status !== LoanStatus.SUBMITTED && loan.status !== LoanStatus.UNDER_REVIEW) {
      throw new BadRequestException('Only submitted or under-review loans can be rejected');
    }

    const updatedLoan = await this.loanRepository.updateLoanStatus(loanId, LoanStatus.REJECTED);

    await prisma.notification.create({
      data: {
        userId: loan.customer.userId,
        title: 'Loan Rejected',
        message: `Your ${loan.loanType.toLowerCase()} loan application has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: loan.customer.userId,
        action: 'LOAN_REJECTED',
        module: 'LOAN',
      },
    });

    return {
      loanId: updatedLoan.id,
      status: updatedLoan.status,
    };
  }

  async cancelLoan(loanId: string, userId: string) {
    const customer = await this.loanRepository.findCustomerByUserId(userId);
    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    const loan = await this.loanRepository.findLoanById(loanId);
    if (!loan) {
      throw new NotFoundException('Loan application not found');
    }

    if (loan.customerId !== customer.id) {
      throw new ForbiddenException('You do not have permission to cancel this loan');
    }

    if (loan.status !== LoanStatus.SUBMITTED && loan.status !== LoanStatus.UNDER_REVIEW) {
      throw new BadRequestException('Only submitted or under-review loans can be cancelled');
    }

    const updatedLoan = await this.loanRepository.updateLoanStatus(loanId, LoanStatus.REJECTED);

    await prisma.notification.create({
      data: {
        userId: customer.userId,
        title: 'Loan Cancelled',
        message: `Your ${loan.loanType.toLowerCase()} loan application has been cancelled.`,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: customer.userId,
        action: 'LOAN_CANCELLED',
        module: 'LOAN',
      },
    });

    return {
      loanId: updatedLoan.id,
      status: updatedLoan.status,
    };
  }
}
