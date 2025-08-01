export interface CreateTransactionDto {
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa' | 'transferencia';
  categoria?: string;
  subcategoria?: string;
  data: Date;
  observacoes?: string;
  contaFinanceiraId?: string;
  userId: string;
}

export interface UpdateTransactionDto {
  id: string;
  descricao?: string;
  valor?: number;
  tipo?: 'receita' | 'despesa' | 'transferencia';
  categoria?: string;
  subcategoria?: string;
  data?: Date;
  observacoes?: string;
  contaFinanceiraId?: string;
  userId: string;
}

export interface DeleteTransactionDto {
  id: string;
  userId: string;
}

export interface GetTransactionDto {
  id: string;
  userId: string;
}

export interface GetUserTransactionsDto {
  userId: string;
  contaFinanceiraId?: string;
  categoria?: string;
  tipo?: 'receita' | 'despesa' | 'transferencia';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface TransactionResponseDto {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa' | 'transferencia';
  categoria?: string;
  subcategoria?: string;
  data: string;
  observacoes?: string;
  contaFinanceiraId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionListResponseDto {
  transactions: TransactionResponseDto[];
  total: number;
  totalValue: number;
  summary: {
    receitas: number;
    despesas: number;
    saldo: number;
  };
}

export interface TransactionStatsDto {
  period: {
    startDate: string;
    endDate: string;
  };
  total: {
    receitas: number;
    despesas: number;
    saldo: number;
    transacoes: number;
  };
  byCategory: Array<{
    categoria: string;
    total: number;
    count: number;
    percentage: number;
  }>;
  byAccount: Array<{
    contaId: string;
    contaNome: string;
    total: number;
    count: number;
  }>;
}