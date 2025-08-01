import { DomainError } from '@src/modules/shared/domain/errors/domain-error';

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid email or password');
  }
}

export class UserNotFoundError extends DomainError {
  constructor() {
    super('User not found');
  }
}