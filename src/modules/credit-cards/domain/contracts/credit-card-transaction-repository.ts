import {CreditCardTransaction} from "@src/modules/credit-cards/domain/entities/credit-card-transaction";

export interface CreditCardTransactionRepository {
  create(transaction: CreditCardTransaction): Promise<CreditCardTransaction>;
  findById(id: string): Promise<CreditCardTransaction | null>;
  findByUserId(userId: string): Promise<CreditCardTransaction[]>;
  findByCreditCardId(creditCardId: string): Promise<CreditCardTransaction[]>;
  findByInvoiceId(invoiceId: string): Promise<CreditCardTransaction[]>;
  findByUserIdWithFilters(userId: string, filters: {
    creditCardId?: string;
    categoria?: string;
    dataInicio?: Date;
    dataFim?: Date;
    search?: string;
  }): Promise<CreditCardTransaction[]>;
  update(id: string, transaction: CreditCardTransaction): Promise<CreditCardTransaction>;
  delete(id: string): Promise<void>;
  findByUserIdAndId(userId: string, id: string): Promise<CreditCardTransaction | null>;
}