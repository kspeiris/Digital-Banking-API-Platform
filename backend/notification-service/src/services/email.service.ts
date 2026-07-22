import { transporter } from '../config/mail';
import { logger } from 'shared-common';

export class EmailService {
  async sendEmail(to: string, subject: string, bodyHtml: string): Promise<boolean> {
    try {
      await transporter.sendMail({
        from: '"Digital Banking Support" <no-reply@digitalbanking.com>',
        to,
        subject,
        html: bodyHtml,
      });
      logger.info(`Email notification sent to ${to} with subject "${subject}"`);
      return true;
    } catch (err) {
      logger.error(`Failed to send email to ${to}:`, err);
      return false;
    }
  }

  generateHtml(title: string, bodyText: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Outfit', 'Inter', sans-serif; background-color: #f4f6fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin: 0 auto; }
          .header { font-size: 24px; color: #1e3a8a; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 20px; font-weight: bold; }
          .body { font-size: 16px; color: #374151; line-height: 1.6; }
          .footer { margin-top: 30px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">${title}</div>
          <div class="body">
            <p>${bodyText}</p>
          </div>
          <div class="footer">
            This is an automated notification from your digital banking platform. Please do not reply directly.
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
