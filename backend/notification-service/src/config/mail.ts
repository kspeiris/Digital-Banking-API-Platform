import nodemailer from 'nodemailer';
import { logger } from 'shared-common';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'mock-user@ethereal.email',
    pass: process.env.SMTP_PASS || 'mock-password',
  },
});

transporter.verify((error) => {
  if (error) {
    logger.warn('Nodemailer SMTP Transporter connection failed. Fallback to delivery logging.');
  } else {
    logger.info('Nodemailer SMTP Transporter configured successfully');
  }
});
