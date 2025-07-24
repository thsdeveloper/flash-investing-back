import bcrypt from 'bcrypt';
import { env } from '../../infrastructure/config/env';

export class Password {
  private readonly hashedValue: string;

  private constructor(hashedValue: string) {
    this.hashedValue = hashedValue;
  }

  static async create(plainPassword: string): Promise<Password> {
    if (plainPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const hashedValue = await bcrypt.hash(plainPassword, env.BCRYPT_ROUNDS);
    return new Password(hashedValue);
  }

  static fromHash(hashedValue: string): Password {
    return new Password(hashedValue);
  }

  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.hashedValue);
  }

  getValue(): string {
    return this.hashedValue;
  }
}