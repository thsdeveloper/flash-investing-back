import { DomainError } from '@src/modules/shared/domain/errors/domain-error';

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`Usuário com email ${email} já existe`, 'USER_ALREADY_EXISTS');
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Email ou senha inválidos', 'INVALID_CREDENTIALS');
  }
}

export class UserNotFoundError extends DomainError {
  constructor() {
    super('Usuário não encontrado', 'USER_NOT_FOUND');
  }
}

export class InvalidPasswordError extends DomainError {
  constructor() {
    super('Senha inválida', 'INVALID_PASSWORD');
  }
}

export class EmailAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`Email ${email} já está em uso`, 'EMAIL_ALREADY_EXISTS');
  }
}

export class WeakPasswordError extends DomainError {
  constructor() {
    super('Senha muito fraca. Deve conter pelo menos 8 caracteres', 'WEAK_PASSWORD');
  }
}

export class InvalidEmailError extends DomainError {
  constructor() {
    super('Formato de email inválido', 'INVALID_EMAIL');
  }
}

export class UnauthorizedError extends DomainError {
  constructor() {
    super('Não autorizado', 'UNAUTHORIZED');
  }
}

export class InvalidTokenError extends DomainError {
  constructor() {
    super('Token inválido', 'INVALID_TOKEN');
  }
}

export class TokenExpiredError extends DomainError {
  constructor() {
    super('Token expirado', 'TOKEN_EXPIRED');
  }
}

export class InsufficientPermissionsError extends DomainError {
  constructor() {
    super('Permissões insuficientes', 'INSUFFICIENT_PERMISSIONS');
  }
}