import crypto from 'crypto';
import { prisma } from '../config/database';

export class OtpService {
  async generateOtp(email: string, purpose: string): Promise<string> {
    // Generate a 6 digit secure code
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Delete any existing OTP for this email and purpose to satisfy "one active OTP per user"
    await prisma.otpVerification.deleteMany({
      where: { email, purpose },
    });

    await prisma.otpVerification.create({
      data: {
        email,
        otp,
        purpose,
        expiresAt,
      },
    });

    return otp;
  }

  async verifyOtp(email: string, otp: string, purpose: string): Promise<boolean> {
    const record = await prisma.otpVerification.findFirst({
      where: { email, purpose },
    });

    if (!record) return false;

    // Check attempts limit (max 5 attempts)
    if (record.attempts >= 5) {
      await prisma.otpVerification.delete({ where: { id: record.id } });
      return false;
    }

    // Check expiry
    if (record.expiresAt < new Date()) {
      await prisma.otpVerification.delete({ where: { id: record.id } });
      return false;
    }

    if (record.otp !== otp) {
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: record.attempts + 1 },
      });
      return false;
    }

    // Success, delete the OTP record
    await prisma.otpVerification.delete({ where: { id: record.id } });
    return true;
  }
}
