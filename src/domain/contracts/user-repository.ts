import { User } from '../entities/user';
import { Email } from '../value-objects/email';

export interface UserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: Email): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}