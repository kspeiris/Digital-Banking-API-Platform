import PDFDocument from 'pdfkit';

export class ReceiptService {
  async generateReceiptPDF(tx: {
    reference: string;
    senderAccount: string | null;
    receiverAccount: string | null;
    amount: number;
    fee: number;
    status: string;
    createdAt: string;
    description: string | null;
    type: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Receipt Styling
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#0f172a').text('DIGITAL BANKING PLATFORM', { align: 'center' });
      doc.fontSize(12).font('Helvetica').fillColor('#64748b').text('Official Transaction Receipt', { align: 'center' });
      doc.moveDown(2);

      // Divider Line
      doc.moveTo(100, doc.y).lineTo(500, doc.y).strokeColor('#cbd5e1').lineWidth(1).stroke();
      doc.moveDown(1.5);

      const drawRow = (label: string, value: string) => {
        const currentY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#475569').text(label, 100, currentY);
        doc.font('Helvetica').fillColor('#0f172a').text(value, 280, currentY);
        doc.moveDown(1.2);
      };

      drawRow('Transaction Reference', tx.reference);
      drawRow('Transaction Type', tx.type);
      drawRow('Timestamp', tx.createdAt);
      drawRow('Sender Account', tx.senderAccount || 'N/A');
      drawRow('Receiver / Beneficiary', tx.receiverAccount || 'N/A');
      drawRow('Amount', `${tx.amount.toFixed(2)} LKR`);
      drawRow('Transaction Fee', `${tx.fee.toFixed(2)} LKR`);
      drawRow('Description', tx.description || 'N/A');
      drawRow('Status', tx.status);

      // Bottom Divider
      doc.moveTo(100, doc.y).lineTo(500, doc.y).strokeColor('#cbd5e1').lineWidth(1).stroke();
      doc.moveDown(2);
      doc.fontSize(9).font('Helvetica-Oblique').fillColor('#94a3b8').text('Thank you for banking with Digital Banking Platform.', { align: 'center' });

      doc.end();
    });
  }
}
