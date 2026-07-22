import crypto from 'crypto';
import bcrypt from 'bcrypt';

export class ApiKeyService {
  generateKeyPair() {
    const apiKey = 'pk_live_' + crypto.randomBytes(12).toString('hex');
    const secret = 'sk_live_' + crypto.randomBytes(16).toString('hex');
    return { apiKey, secret };
  }

  async hashSecret(secret: string): Promise<string> {
    return bcrypt.hash(secret, 10);
  }
}
