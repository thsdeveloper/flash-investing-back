import {Transaction} from "@src/modules/transactions/domain/entities/transaction";

export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string): Promise<Transaction[]>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
  findByUserIdAndAccountId(userId: string, accountId: string): Promise<Transaction[]>;
  findByUserIdAndCategory(userId: string, category: string): Promise<Transaction[]>;
  findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
  getTotalByUserAndCategory(userId: string, category: string, startDate: Date, endDate: Date): Promise<number>;
  getTotalByUserAndType(userId: string, type: 'receita' | 'despesa', startDate: Date, endDate: Date): Promise<number>;
}