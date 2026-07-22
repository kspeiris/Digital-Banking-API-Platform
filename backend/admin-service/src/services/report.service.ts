import { prisma } from '../config/database';

export class ReportService {
  async generateReport(type: string, format: string, from?: string, to?: string): Promise<Buffer> {
    const where: any = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    if (type === 'transactions') {
      const txs = await prisma.transaction.findMany({ where, orderBy: { createdAt: 'desc' } });
      const csvLines = [
        'Reference,Type,Amount,Currency,Status,Created At',
        ...txs.map(
          (t) =>
            `"${t.transactionReference}","${t.transactionType}",${Number(
              t.amount
            )},"${t.currency}","${t.status}","${t.createdAt.toISOString()}"`
        ),
      ];
      return this.formatOutput(csvLines.join('\n'), format);
    }

    if (type === 'customers') {
      const customers = await prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      });
      const csvLines = [
        'ID,First Name,Last Name,Email,NIC,KYC Status',
        ...customers.map(
          (c) =>
            `"${c.id}","${c.firstName}","${c.lastName}","${c.user.email}","${c.nic}","${c.kycStatus}"`
        ),
      ];
      return this.formatOutput(csvLines.join('\n'), format);
    }

    if (type === 'loans') {
      const loans = await prisma.loan.findMany({ orderBy: { submittedAt: 'desc' } });
      const csvLines = [
        'ID,Type,Requested Amount,Approved Amount,Status,Submitted At',
        ...loans.map(
          (l) =>
            `"${l.id}","${l.loanType}",${Number(l.requestedAmount)},${Number(
              l.approvedAmount
            )},"${l.status}","${l.submittedAt.toISOString()}"`
        ),
      ];
      return this.formatOutput(csvLines.join('\n'), format);
    }

    // Fallback/other reports
    const defaultLines = ['Report Type,Generated At', `"${type}","${new Date().toISOString()}"`];
    return this.formatOutput(defaultLines.join('\n'), format);
  }

  private formatOutput(csvContent: string, format: string): Buffer {
    if (format === 'pdf') {
      // Mock PDF structure
      const pdfText = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length ${csvContent.length} >>\nstream\n${csvContent}\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n310\n%%EOF`;
      return Buffer.from(pdfText, 'utf-8');
    }
    return Buffer.from(csvContent, 'utf-8');
  }
}
