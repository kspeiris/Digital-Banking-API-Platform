import { transporter } from '../config/mail';
import { logger } from 'shared-common';

export class EmailService {
  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: '"Digital Bank Support" <support@digitalbank.com>',
      to: email,
      subject: 'Verify your email address',
      text: `Your email verification OTP is ${otp}. It will expire in 5 minutes.`,
      html: `<p>Your email verification OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}`, { messageId: info.messageId });
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`[MOCK EMAIL] Verification Email Payload:`, info);
    }
  }

  async sendPasswordResetEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: '"Digital Bank Support" <support@digitalbank.com>',
      to: email,
      subject: 'Reset your password',
      text: `Your password reset OTP is ${otp}. It will expire in 5 minutes.`,
      html: `<p>Your password reset OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}`, { messageId: info.messageId });
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`[MOCK EMAIL] Password Reset Email Payload:`, info);
    }
  }
}
