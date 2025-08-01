export interface CreateCreditCardDto {
  nome: string;
  bandeira: 'visa' | 'mastercard' | 'elo' | 'american_express' | 'diners' | 'hipercard' | 'outros';
  ultimosDigitos: string;
  limiteTotal: number;
  diaVencimento: number;
  diaFechamento: number;
  contaFinanceiraId: string;
  banco?: string;
  cor?: string;
  ativo?: boolean;
  observacoes?: string;
}

export interface UpdateCreditCardDto {
  nome?: string;
  bandeira?: 'visa' | 'mastercard' | 'elo' | 'american_express' | 'diners' | 'hipercard' | 'outros';
  ultimosDigitos?: string;
  limiteTotal?: number;
  diaVencimento?: number;
  diaFechamento?: number;
  contaFinanceiraId?: string;
  banco?: string;
  cor?: string;
  ativo?: boolean;
  observacoes?: string;
}

export interface CreditCardResponseDto {
  id: string;
  nome: string;
  bandeira: string;
  ultimosDigitos: string;
  limiteTotal: number;
  limiteDisponivel: number;
  diaVencimento: number;
  diaFechamento: number;
  banco?: string;
  cor?: string;
  ativo: boolean;
  observacoes?: string;
  percentualUso: number;
  valorUtilizado: number;
  melhorDiaCompra: number;
  prazoMaximoPagamento: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCardLimitDto {
  valor: number;
}

export interface CreditCardUsageDto {
  totalCards: number;
  totalLimit: number;
  totalUsed: number;
  totalAvailable: number;
  averageUsagePercentage: number;
  cardsNearLimit: number; // Cards com uso > 80%
  inactiveCards: number;
}