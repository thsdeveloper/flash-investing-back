import {DebtNegotiation} from "@src/modules/debts/domain/entities/debt-negotiation";

export interface DebtNegotiationFilters {
  debtId?: string;
  status?: string;
  userId: string;
}

export interface DebtNegotiationRepository {
  create(negotiation: DebtNegotiation): Promise<DebtNegotiation>;
  findById(id: string, userId: string): Promise<DebtNegotiation | null>;
  findByDebtId(
    debtId: string,
    userId: string,
    pagination?: { page: number; limit: number }
  ): Promise<{
    data: DebtNegotiation[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  }>;
  findMany(
    filters: DebtNegotiationFilters,
    pagination?: { page: number; limit: number }
  ): Promise<{
    data: DebtNegotiation[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  }>;
  update(negotiation: DebtNegotiation): Promise<DebtNegotiation>;
  delete(id: string, userId: string): Promise<void>;
  findPendingNegotiations(userId: string): Promise<DebtNegotiation[]>;
}