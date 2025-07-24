export interface CreateCreditCardTransactionDto {
  descricao: string;
  valor: number;
  categoria?: string;
  subcategoria?: string;
  dataCompra: Date;
  parcelas?: number;
  parcelaAtual?: number;
  estabelecimento?: string;
  observacoes?: string;
  creditCardId: string;
  invoiceId?: string;
  userId: string;
}

export interface UpdateCreditCardTransactionDto {
  descricao?: string;
  valor?: number;
  categoria?: string;
  subcategoria?: string;
  dataCompra?: Date;
  parcelas?: number;
  parcelaAtual?: number;
  estabelecimento?: string;
  observacoes?: string;
  creditCardId?: string;
  invoiceId?: string;
}

export interface CreditCardTransactionResponseDto {
  id: string;
  descricao: string;
  valor: number;
  categoria?: string;
  subcategoria?: string;
  dataCompra: string;
  parcelas: number;
  parcelaAtual: number;
  estabelecimento?: string;
  observacoes?: string;
  creditCardId: string;
  invoiceId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  // Campos calculados
  isParcelada: boolean;
  isUltimaParcela: boolean;
  parcelaDescricao: string;
  valorParcela: number;
  valorTotal: number;
}

export interface CreditCardTransactionListDto {
  data: CreditCardTransactionResponseDto[];
  meta: {
    total_count: number;
    filter_count: number;
  };
}

export interface CreditCardTransactionFiltersDto {
  creditCardId?: string;
  categoria?: string;
  dataInicio?: Date;
  dataFim?: Date;
  search?: string;
}