import bcrypt from 'bcrypt';

export class PinService {
  async comparePin(pin: string, hash: string): Promise<boolean> {
    return bcrypt.compare(pin, hash);
  }

  async hashPin(pin: string): Promise<string> {
    return bcrypt.hash(pin, 10);
  }
}
