import crypto from 'crypto';
import { redis } from '../config/redis';

export class OtpService {
  async generateOtp(email: string, purpose: string): Promise<string> {
    // Generate a 6 digit secure code
    const otp = crypto.randomInt(100000, 999999).toString();
    const key = `otp:${email}:${purpose}`;
    const attemptsKey = `otp:attempts:${email}:${purpose}`;

    // Store in Redis with 5 minutes expiry (300 seconds)
    await redis.set(key, otp, { EX: 300 });
    await redis.set(attemptsKey, '0', { EX: 300 });

    return otp;
  }

  async verifyOtp(email: string, otp: string, purpose: string): Promise<boolean> {
    const key = `otp:${email}:${purpose}`;
    const attemptsKey = `otp:attempts:${email}:${purpose}`;

    const storedOtp = await redis.get(key);
    if (!storedOtp) return false;

    const attemptsStr = await redis.get(attemptsKey) || '0';
    const attempts = Number(attemptsStr);

    // Check attempts limit (max 5 attempts)
    if (attempts >= 5) {
      await redis.del(key);
      await redis.del(attemptsKey);
      return false;
    }

    if (storedOtp !== otp) {
      await redis.incr(attemptsKey);
      return false;
    }

    // Success, delete the OTP records
    await redis.del(key);
    await redis.del(attemptsKey);
    return true;
  }
}
