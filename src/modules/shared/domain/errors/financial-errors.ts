import { DomainError } from './domain-error';

// ===== FINANCIAL ACCOUNT ERRORS =====

export class FinancialAccountNotFoundError extends DomainError {
  constructor() {
    super('Conta financeira não encontrada', 'FINANCIAL_ACCOUNT_NOT_FOUND');
  }
}

export class FinancialAccountAlreadyExistsError extends DomainError {
  constructor(accountName: string) {
    super(`Conta financeira '${accountName}' já existe`, 'FINANCIAL_ACCOUNT_ALREADY_EXISTS');
  }
}

export class InsufficientFundsError extends DomainError {
  constructor() {
    super('Saldo insuficiente', 'INSUFFICIENT_FUNDS');
  }
}

export class InvalidAccountTypeError extends DomainError {
  constructor(type: string) {
    super(`Tipo de conta '${type}' inválido`, 'INVALID_ACCOUNT_TYPE');
  }
}

// ===== TRANSACTION ERRORS =====

export class TransactionNotFoundError extends DomainError {
  constructor() {
    super('Transação não encontrada', 'TRANSACTION_NOT_FOUND');
  }
}

export class InvalidTransactionAmountError extends DomainError {
  constructor() {
    super('Valor da transação deve ser maior que zero', 'INVALID_TRANSACTION_AMOUNT');
  }
}

export class InvalidTransactionTypeError extends DomainError {
  constructor(type: string) {
    super(`Tipo de transação '${type}' inválido`, 'INVALID_TRANSACTION_TYPE');
  }
}

export class TransactionAlreadyCompletedError extends DomainError {
  constructor() {
    super('Transação já foi marcada como concluída', 'TRANSACTION_ALREADY_COMPLETED');
  }
}

// ===== FINANCIAL CATEGORY ERRORS =====

export class FinancialCategoryNotFoundError extends DomainError {
  constructor() {
    super('Categoria financeira não encontrada', 'FINANCIAL_CATEGORY_NOT_FOUND');
  }
}

export class CategoryAlreadyExistsError extends DomainError {
  constructor(categoryName: string) {
    super(`Categoria '${categoryName}' já existe`, 'CATEGORY_ALREADY_EXISTS');
  }
}

export class CategoryInUseError extends DomainError {
  constructor() {
    super('Categoria não pode ser removida pois está sendo utilizada', 'CATEGORY_IN_USE');
  }
}

// ===== CREDIT CARD ERRORS =====

export class CreditCardNotFoundError extends DomainError {
  constructor() {
    super('Cartão de crédito não encontrado', 'CREDIT_CARD_NOT_FOUND');
  }
}

export class CreditCardTransactionNotFoundError extends DomainError {
  constructor() {
    super('Transação de cartão de crédito não encontrada', 'CREDIT_CARD_TRANSACTION_NOT_FOUND');
  }
}

export class InvalidCreditLimitError extends DomainError {
  constructor() {
    super('Limite de crédito deve ser maior que zero', 'INVALID_CREDIT_LIMIT');
  }
}

export class CreditLimitExceededError extends DomainError {
  constructor() {
    super('Limite de crédito excedido', 'CREDIT_LIMIT_EXCEEDED');
  }
}

// ===== DEBT ERRORS =====

export class DebtNotFoundError extends DomainError {
  constructor() {
    super('Dívida não encontrada', 'DEBT_NOT_FOUND');
  }
}

export class DebtPaymentNotFoundError extends DomainError {
  constructor() {
    super('Pagamento de dívida não encontrado', 'DEBT_PAYMENT_NOT_FOUND');
  }
}

export class DebtNegotiationNotFoundError extends DomainError {
  constructor() {
    super('Negociação de dívida não encontrada', 'DEBT_NEGOTIATION_NOT_FOUND');
  }
}

export class PaymentExceedsDebtError extends DomainError {
  constructor() {
    super('Valor do pagamento excede o valor da dívida', 'PAYMENT_EXCEEDS_DEBT');
  }
}

export class DebtAlreadyPaidError extends DomainError {
  constructor() {
    super('Dívida já foi quitada', 'DEBT_ALREADY_PAID');
  }
}

export class InvalidInterestRateError extends DomainError {
  constructor() {
    super('Taxa de juros deve ser maior ou igual a zero', 'INVALID_INTEREST_RATE');
  }
}

// ===== INVESTMENT ERRORS =====

export class InvestmentPortfolioNotFoundError extends DomainError {
  constructor() {
    super('Portfólio de investimento não encontrado', 'INVESTMENT_PORTFOLIO_NOT_FOUND');
  }
}

export class InvestmentAssetNotFoundError extends DomainError {
  constructor() {
    super('Ativo de investimento não encontrado', 'INVESTMENT_ASSET_NOT_FOUND');
  }
}

export class InvalidAssetQuantityError extends DomainError {
  constructor() {
    super('Quantidade de ativo deve ser maior que zero', 'INVALID_ASSET_QUANTITY');
  }
}

export class InvalidAssetPriceError extends DomainError {
  constructor() {
    super('Preço do ativo deve ser maior que zero', 'INVALID_ASSET_PRICE');
  }
}

// ===== BUDGET ERRORS =====

export class BudgetNotFoundError extends DomainError {
  constructor() {
    super('Orçamento não encontrado', 'BUDGET_NOT_FOUND');
  }
}

export class InvalidBudgetRuleError extends DomainError {
  constructor() {
    super('Regra de orçamento inválida', 'INVALID_BUDGET_RULE');
  }
}

export class BudgetExceededError extends DomainError {
  constructor(categoryName: string) {
    super(`Orçamento da categoria '${categoryName}' foi excedido`, 'BUDGET_EXCEEDED');
  }
}

// ===== VALIDATION ERRORS =====

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class RequiredFieldError extends DomainError {
  constructor(fieldName: string) {
    super(`Campo '${fieldName}' é obrigatório`, 'REQUIRED_FIELD_ERROR');
  }
}

export class InvalidDateRangeError extends DomainError {
  constructor() {
    super('Data de início deve ser anterior à data de fim', 'INVALID_DATE_RANGE');
  }
}

export class InvalidFormatError extends DomainError {
  constructor(fieldName: string) {
    super(`Formato do campo '${fieldName}' é inválido`, 'INVALID_FORMAT');
  }
}