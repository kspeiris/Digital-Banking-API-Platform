import { prisma } from '../config/database';
import ExcelJS from 'exceljs';

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
      const headers = ['Reference', 'Type', 'Amount', 'Currency', 'Status', 'Created At'];
      const rows = txs.map((t) => [t.transactionReference, t.transactionType, Number(t.amount), t.currency, t.status, t.createdAt.toISOString()]);
      return await this.formatOutput(headers, rows, format);
    }

    if (type === 'customers') {
      const customers = await prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      });
      const headers = ['ID', 'First Name', 'Last Name', 'Email', 'NIC', 'KYC Status'];
      const rows = customers.map((c) => [c.id, c.firstName, c.lastName, c.user.email, c.nic, c.kycStatus]);
      return await this.formatOutput(headers, rows, format);
    }

    if (type === 'loans') {
      const loans = await prisma.loan.findMany({ orderBy: { submittedAt: 'desc' } });
      const headers = ['ID', 'Type', 'Requested Amount', 'Approved Amount', 'Status', 'Submitted At'];
      const rows = loans.map((l) => [l.id, l.loanType, Number(l.requestedAmount), Number(l.approvedAmount), l.status, l.submittedAt.toISOString()]);
      return await this.formatOutput(headers, rows, format);
    }

    const headers = ['Report Type', 'Generated At'];
    const rows = [[type, new Date().toISOString()]];
    return this.formatOutput(headers, rows, format);
  }

  private async formatOutput(headers: string[], rows: any[][], format: string): Promise<Buffer> {
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report');
      worksheet.addRow(headers);
      rows.forEach((row) => worksheet.addRow(row));
      return Buffer.from(await workbook.xlsx.writeBuffer());
    }

    if (format === 'pdf') {
      const pdfText = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length ${Buffer.byteLength(headers.join(',') + rows.map(r => r.join(',')).join('\n'))} >>\nstream\n${headers.join(',')}\n${rows.map(r => r.join(',')).join('\n')}\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n310\n%%EOF`;
      return Buffer.from(pdfText, 'utf-8');
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    return Buffer.from(csvContent, 'utf-8');
  }
}
