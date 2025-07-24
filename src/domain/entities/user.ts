import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';

export interface UserProps {
  id?: string;
  name: string;
  email: Email;
  password: Password;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private readonly id?: string;
  private name: string;
  private email: Email;
  private password: Password;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  getId(): string | undefined {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
  }

  getPassword(): Password {
    return this.password;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  async updatePassword(newPassword: string): Promise<void> {
    this.password = await Password.create(newPassword);
    this.updatedAt = new Date();
  }

  async verifyPassword(plainPassword: string): Promise<boolean> {
    return this.password.compare(plainPassword);
  }
}