import {User} from "@src/modules/users/domain/entities/user";
import {Email} from "@src/modules/shared/domain/value-objects/email";

export interface UserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: Email): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}