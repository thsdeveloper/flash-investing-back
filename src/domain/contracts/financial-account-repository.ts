import { FinancialAccount, FinancialAccountType } from '../entities/financial-account';

export interface FinancialAccountRepository {
  create(account: FinancialAccount): Promise<FinancialAccount>;
  findById(id: string): Promise<FinancialAccount | null>;
  findByUserId(userId: string): Promise<FinancialAccount[]>;

    findByUserIdAndId(userId: string, id: string | undefined): Promise<FinancialAccount | null>;
  findByUserIdAndType(userId: string, type: FinancialAccountType): Promise<FinancialAccount[]>;
  findActiveByUserId(userId: string): Promise<FinancialAccount[]>;
  update(account: FinancialAccount): Promise<FinancialAccount>;
  updateSaldo(id: string, novoSaldo: number): Promise<void>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
}