import { AccountRepository } from '../repositories/account.repository';
import { AccountService } from './account.service';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export class StatementService {
  private accountRepository: AccountRepository;
  private accountService: AccountService;

  constructor() {
    this.accountRepository = new AccountRepository();
    this.accountService = new AccountService();
  }

  async getStatementData(
    accountId: string,
    userId: string,
    role: string,
    fromDateStr?: string,
    toDateStr?: string
  ) {
    // 1. Verify access and get account details
    const account = await this.accountService.verifyAccountAccess(accountId, userId, role);

    // 2. Determine date ranges (defaults: last 30 days)
    const toDate = toDateStr ? new Date(toDateStr + 'T23:59:59.999Z') : new Date();
    const fromDate = fromDateStr
      ? new Date(fromDateStr + 'T00:00:00.000Z')
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const fromDateIso = fromDate.toISOString().split('T')[0];
    const toDateIso = toDate.toISOString().split('T')[0];

    // 3. Get starting balance at fromDate
    const startBalance = await this.accountRepository.calculateBalanceBeforeDate(accountId, fromDate);

    // 4. Fetch all transactions in the range to compute accurate running balances
    const allTransactions = await this.accountRepository.findTransactionsForAccount(
      accountId,
      fromDate,
      toDate,
      0,
      100000 // A large number to fetch all in date range for statement calculation
    );

    let currentBalance = startBalance;
    const formattedTransactions = allTransactions.map((tx) => {
      let credit = 0;
      let debit = 0;

      if (tx.toAccountId === accountId) {
        credit = Number(tx.amount);
        currentBalance += credit;
      } else if (tx.fromAccountId === accountId) {
        debit = Number(tx.amount);
        currentBalance -= (debit + Number(tx.fee));
      }

      return {
        reference: tx.transactionReference,
        date: tx.createdAt.toISOString().split('T')[0],
        description: tx.description || 'Transfer',
        credit,
        debit,
        balance: currentBalance,
      };
    });

    return {
      account,
      fromDateIso,
      toDateIso,
      startBalance,
      transactions: formattedTransactions,
    };
  }

  async generatePDF(
    account: any,
    fromDateStr: string,
    toDateStr: string,
    transactions: any[],
    startBalance: number
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Document Title/Header
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#0f172a').text('DIGITAL BANKING PLATFORM', { align: 'center' });
      doc.fontSize(12).font('Helvetica').fillColor('#64748b').text('Official Account Statement', { align: 'center' });
      doc.moveDown(1.5);

      // Account Details Info Box
      const detailsTop = doc.y;
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155');
      doc.text('Account Details:', 50, detailsTop);
      doc.font('Helvetica').text(`Account Number: ${account.accountNumber}`, 50, detailsTop + 15);
      doc.text(`Account Type: ${account.accountType.toUpperCase()}`, 50, detailsTop + 30);
      doc.text(`Branch: ${account.branch}`, 50, detailsTop + 45);

      doc.font('Helvetica-Bold').text('Statement Period:', 320, detailsTop);
      doc.font('Helvetica').text(`From: ${fromDateStr}`, 320, detailsTop + 15);
      doc.text(`To: ${toDateStr}`, 320, detailsTop + 30);
      doc.text(`Currency: ${account.currency}`, 320, detailsTop + 45);
      doc.text(`Starting Balance: ${account.currency} ${startBalance.toFixed(2)}`, 320, detailsTop + 60);

      doc.moveDown(5);

      // Table Headers
      const tableTop = doc.y + 10;
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#475569');
      doc.text('Date', 50, tableTop);
      doc.text('Reference', 120, tableTop);
      doc.text('Description', 210, tableTop);
      doc.text('Debit', 340, tableTop, { width: 60, align: 'right' });
      doc.text('Credit', 410, tableTop, { width: 60, align: 'right' });
      doc.text('Balance', 480, tableTop, { width: 60, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(540, tableTop + 15).strokeColor('#cbd5e1').lineWidth(1).stroke();

      let y = tableTop + 25;
      doc.font('Helvetica').fillColor('#334155');

      for (const tx of transactions) {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        doc.text(tx.date, 50, y);
        doc.text(tx.reference, 120, y);
        doc.text(tx.description.length > 22 ? tx.description.substring(0, 22) + '...' : tx.description, 210, y);
        doc.text(tx.debit > 0 ? tx.debit.toFixed(2) : '-', 340, y, { width: 60, align: 'right' });
        doc.text(tx.credit > 0 ? tx.credit.toFixed(2) : '-', 410, y, { width: 60, align: 'right' });
        doc.text(tx.balance.toFixed(2), 480, y, { width: 60, align: 'right' });
        y += 20;
      }

      doc.end();
    });
  }

  async generateExcel(
    account: any,
    fromDateStr: string,
    toDateStr: string,
    transactions: any[],
    startBalance: number
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Account Statement');

    // Title Block
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'DIGITAL BANKING PLATFORM';
    worksheet.getCell('A1').font = { size: 16, bold: true, color: { argb: '0F172A' } };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = 'Account Statement';
    worksheet.getCell('A2').font = { size: 12, italic: true, color: { argb: '64748B' } };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    // Metadata Block
    worksheet.getCell('A4').value = 'Account Number:';
    worksheet.getCell('A4').font = { bold: true };
    worksheet.getCell('B4').value = account.accountNumber;

    worksheet.getCell('A5').value = 'Account Type:';
    worksheet.getCell('A5').font = { bold: true };
    worksheet.getCell('B5').value = account.accountType.toUpperCase();

    worksheet.getCell('A6').value = 'Branch:';
    worksheet.getCell('A6').font = { bold: true };
    worksheet.getCell('B6').value = account.branch;

    worksheet.getCell('D4').value = 'Period From:';
    worksheet.getCell('D4').font = { bold: true };
    worksheet.getCell('E4').value = fromDateStr;

    worksheet.getCell('D5').value = 'Period To:';
    worksheet.getCell('D5').font = { bold: true };
    worksheet.getCell('E5').value = toDateStr;

    worksheet.getCell('D6').value = 'Starting Balance:';
    worksheet.getCell('D6').font = { bold: true };
    worksheet.getCell('E6').value = `${account.currency} ${startBalance.toFixed(2)}`;

    // Headers Row
    const headers = ['Date', 'Reference', 'Description', 'Debit', 'Credit', 'Balance'];
    worksheet.addRow([]);
    worksheet.addRow([]);
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E293B' },
      };
      cell.alignment = { horizontal: cell.value === 'Description' ? 'left' : 'right' };
    });

    // Data Rows
    transactions.forEach((tx) => {
      const row = worksheet.addRow([
        tx.date,
        tx.reference,
        tx.description,
        tx.debit > 0 ? tx.debit : null,
        tx.credit > 0 ? tx.credit : null,
        tx.balance,
      ]);

      // Align columns
      row.getCell(1).alignment = { horizontal: 'left' };
      row.getCell(2).alignment = { horizontal: 'left' };
      row.getCell(3).alignment = { horizontal: 'left' };
      row.getCell(4).alignment = { horizontal: 'right' };
      row.getCell(5).alignment = { horizontal: 'right' };
      row.getCell(6).alignment = { horizontal: 'right' };

      // Number formats
      row.getCell(4).numFmt = '#,##0.00';
      row.getCell(5).numFmt = '#,##0.00';
      row.getCell(6).numFmt = '#,##0.00';
    });

    // Auto-fit Columns
    worksheet.columns.forEach((column) => {
      let maxLen = 0;
      column.eachCell!({ includeEmpty: true }, (cell) => {
        const valStr = cell.value ? cell.value.toString() : '';
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      });
      column.width = Math.max(maxLen + 4, 12);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
