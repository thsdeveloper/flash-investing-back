import { FinancialAccountType } from '../../domain/entities/financial-account';

export interface CreateFinancialAccountDto {
  nome: string;
  tipo: FinancialAccountType;
  instituicao?: string;
  saldoInicial: number;
  cor?: string;
  icone?: string;
  observacoes?: string;
  userId: string;
}

export interface UpdateFinancialAccountDto {
  nome?: string;
  tipo?: FinancialAccountType;
  instituicao?: string;
  saldoInicial?: number;
  saldoAtual?: number;
  cor?: string;
  icone?: string;
  ativa?: boolean;
  observacoes?: string;
}

export interface FinancialAccountResponseDto {
  id: string;
  nome: string;
  tipo: FinancialAccountType;
  instituicao?: string;
  saldo_inicial: number;
  saldo_atual: number;
  cor?: string;
  icone?: string;
  ativa: boolean;
  observacoes?: string;
  user: string;
  date_created: string;
  date_updated: string;
}

export interface FinancialAccountListDto {
  data: FinancialAccountResponseDto[];
  meta: {
    total_count: number;
    filter_count: number;
  };
}

export interface AccountTransferDto {
  contaOrigemId: string;
  contaDestinoId: string;
  valor: number;
  descricao?: string;
  data?: Date;
  userId: string;
}