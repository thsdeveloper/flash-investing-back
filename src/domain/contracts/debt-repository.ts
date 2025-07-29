import { Debt } from '../entities/debt';

export interface DebtFilters {
  status?: string;
  credor?: string;
  userId: string;
}

export interface DebtSort {
  field: 'valor' | 'data_vencimento' | 'created_at';
  order: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export interface DebtRepository {
  create(debt: Debt): Promise<Debt>;
  findById(id: string, userId: string): Promise<Debt | null>;
  findMany(
    filters: DebtFilters,
    sort: DebtSort,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Debt>>;
  findByIdWithRelations(id: string, userId: string): Promise<Debt & {
    payments: Array<{
      id: string;
      valor: number;
      data_pagamento: Date;
      tipo: 'pagamento_parcial' | 'quitacao_total';
      observacoes?: string;
    }>;
    negotiations: Array<{
      id: string;
      data_negociacao: Date;
      proposta: string;
      status: 'pendente' | 'aceita' | 'rejeitada' | 'em_andamento';
      observacoes?: string;
    }>;
  } | null>;
  update(debt: Debt): Promise<Debt>;
  delete(id: string, userId: string): Promise<void>;
  findUpcomingDueDates(userId: string, limit?: number): Promise<Array<{
    id: string;
    credor: string;
    valor_atual: number;
    data_vencimento: Date;
  }>>;
  findOverdueDebts(userId: string): Promise<Debt[]>;
  getSummaryByUser(userId: string): Promise<{
    total_dividas: number;
    valor_total_original: number;
    valor_total_atual: number;
    total_pago: number;
    dividas_por_status: {
      ativa: number;
      em_negociacao: number;
      quitada: number;
    };
    dividas_por_tipo: Record<string, number>;
  }>;
  getEvolution(userId: string, months: number): Promise<Array<{
    mes: string;
    valor_total: number;
    total_pago: number;
    saldo_devedor: number;
  }>>;
  findByIds(ids: string[], userId: string): Promise<Debt[]>;
}