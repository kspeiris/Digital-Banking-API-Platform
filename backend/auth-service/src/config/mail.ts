import nodemailer from 'nodemailer';
import { logger } from 'shared-common';

// In development/test, we use a mock transporter that logs emails to the console
// or we can read from SMTP environment variables.
const useMockMail = process.env.MAIL_HOST ? false : true;

export const transporter = useMockMail
  ? nodemailer.createTransport({
      jsonTransport: true,
    })
  : nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT || 587),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

if (useMockMail) {
  logger.info('Using JSON Mock Mail Transporter (emails will be logged to console/files)');
} else {
  logger.info(`Mail SMTP Transporter initialized using host: ${process.env.MAIL_HOST}`);
}
