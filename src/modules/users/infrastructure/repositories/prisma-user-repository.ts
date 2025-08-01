import { PrismaClient } from '@prisma/client';
import {UserRepository} from "@src/modules/users/domain/contracts/user-repository";
import {User} from "@src/modules/users/domain/entities/user";
import {Email} from "@src/modules/shared/domain/value-objects/email";
import {Password} from "@src/modules/shared/domain/value-objects/password";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(user: User): Promise<User> {
    const data = await this.prisma.user.create({
      data: {
        name: user.getName(),
        email: user.getEmail().getValue(),
        password: user.getPassword().getValue(),
      },
    });

    return this.toDomain(data);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: {
        email: email.getValue(),
      },
    });

    return data ? this.toDomain(data) : null;
  }

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { id },
    });

    return data ? this.toDomain(data) : null;
  }

  async update(user: User): Promise<User> {
    const data = await this.prisma.user.update({
      where: { id: user.getId() },
      data: {
        name: user.getName(),
        email: user.getEmail().getValue(),
        password: user.getPassword().getValue(),
      },
    });

    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  private toDomain(raw: any): User {
    return new User({
      id: raw.id,
      name: raw.name,
      email: new Email(raw.email),
      password: Password.fromHash(raw.password),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}