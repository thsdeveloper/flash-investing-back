import { DebtPayment } from '../entities/debt-payment';

export interface DebtPaymentFilters {
  debtId: string;
  userId: string;
}

export interface DebtPaymentRepository {
  create(payment: DebtPayment): Promise<DebtPayment>;
  findById(id: string, userId: string): Promise<DebtPayment | null>;
  findByDebtId(
    debtId: string,
    userId: string,
    pagination?: { page: number; limit: number }
  ): Promise<{
    data: DebtPayment[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  }>;
  update(payment: DebtPayment): Promise<DebtPayment>;
  delete(id: string, userId: string): Promise<void>;
  getTotalPaidByDebt(debtId: string, userId: string): Promise<number>;
  getTotalPaidByUser(userId: string): Promise<number>;
}