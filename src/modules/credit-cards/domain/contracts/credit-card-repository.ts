import {CreditCard} from "@src/modules/credit-cards/domain/entities/credit-card";

export interface CreditCardRepository {
  create(creditCard: CreditCard): Promise<CreditCard>;
  findById(id: string): Promise<CreditCard | null>;
  findByUserId(userId: string): Promise<CreditCard[]>;
  findActiveByUserId(userId: string): Promise<CreditCard[]>;
  update(id: string, creditCard: Partial<CreditCard>): Promise<CreditCard>;
  delete(id: string): Promise<void>;
  findByUserIdAndLastDigits(userId: string, lastDigits: string): Promise<CreditCard[]>;
  findByUserIdAndId(userId: string, id: string): Promise<CreditCard | null>;
  findByFinancialAccountId(financialAccountId: string): Promise<CreditCard[]>;
  countByFinancialAccountId(financialAccountId: string): Promise<number>;
}