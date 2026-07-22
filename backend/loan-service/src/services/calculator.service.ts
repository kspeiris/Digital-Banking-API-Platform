export class CalculatorService {
  getInterestRate(loanType: string): number {
    switch (loanType.toUpperCase()) {
      case 'HOME':
        return 8.0;
      case 'VEHICLE':
        return 9.0;
      case 'EDUCATION':
        return 6.0;
      case 'PERSONAL':
      default:
        return 12.0;
    }
  }

  calculateEMI(principal: number, loanType: string, durationMonths: number) {
    const annualRate = this.getInterestRate(loanType);
    const monthlyRate = annualRate / 12 / 100; // R

    if (monthlyRate === 0) {
      return {
        emi: Math.round(principal / durationMonths),
        interestRate: annualRate,
      };
    }

    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
      (Math.pow(1 + monthlyRate, durationMonths) - 1);

    return {
      emi: Math.round(emi),
      interestRate: annualRate,
    };
  }
}
