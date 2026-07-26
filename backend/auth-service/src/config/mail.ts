import nodemailer from 'nodemailer';
import { logger } from 'shared-common';

const MAIL_HOST = process.env.MAIL_HOST;
const useMockMail = !MAIL_HOST;

export const transporter = useMockMail
  ? nodemailer.createTransport({
      jsonTransport: true,
    })
  : nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(process.env.MAIL_PORT || 587),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

if (useMockMail) {
  logger.warn('Using JSON Mock Mail Transporter (emails will be logged to console/files). Set MAIL_HOST to enable real SMTP.');
} else {
  logger.info(`Mail SMTP Transporter initialized using host: ${MAIL_HOST}`);
}
