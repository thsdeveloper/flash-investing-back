import { z } from 'zod';

export class Email {
  private readonly value: string;

  constructor(value: string) {
    const validation = z.string().email().safeParse(value);
    
    if (!validation.success) {
      throw new Error('Invalid email format');
    }
    
    this.value = value.toLowerCase();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}