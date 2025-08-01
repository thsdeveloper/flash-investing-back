// Input DTOs
export interface CreateDebtDto {
  credor: string;
  tipo_divida: 'cartao_credito' | 'emprestimo_pessoal' | 'financiamento' | 'cheque_especial' | 'outros';
  valor_original: number;
  taxa_juros?: number;
  data_vencimento: Date;
  descricao?: string;
  parcelas_total?: number;
  valor_parcela?: number;
  userId: string;
}

export interface UpdateDebtDto {
  id: string;
  credor?: string;
  taxa_juros?: number;
  data_vencimento?: Date;
  descricao?: string;
  status?: 'ativa' | 'quitada' | 'em_negociacao' | 'vencida';
  userId: string;
}

export interface CreateDebtPaymentDto {
  debtId: string;
  valor: number;
  data_pagamento: Date;
  tipo: 'pagamento_parcial' | 'quitacao_total';
  observacoes?: string;
  userId: string;
}

export interface CreateDebtNegotiationDto {
  debtId: string;
  data_negociacao: Date;
  proposta: string;
  status: 'pendente' | 'aceita' | 'rejeitada' | 'em_andamento';
  observacoes?: string;
  userId: string;
}

export interface UpdateDebtNegotiationDto {
  id: string;
  status: 'pendente' | 'aceita' | 'rejeitada' | 'em_andamento';
  observacoes?: string;
  userId: string;
}

// Output DTOs
export interface DebtResponseDto {
  id: string;
  credor: string;
  tipo_divida: 'cartao_credito' | 'emprestimo_pessoal' | 'financiamento' | 'cheque_especial' | 'outros';
  valor_original: number;
  valor_atual: number;
  taxa_juros: number | null;
  data_vencimento: string;
  status: 'ativa' | 'quitada' | 'em_negociacao' | 'vencida';
  descricao: string | null;
  parcelas_total: number | null;
  valor_parcela: number | null;
  created_at: string;
  updated_at: string;
}

export interface DebtWithRelationsResponseDto extends DebtResponseDto {
  pagamentos: Array<{
    id: string;
    valor: number;
    data_pagamento: string;
    tipo: 'pagamento_parcial' | 'quitacao_total';
    observacoes: string | null;
  }>;
  negociacoes: Array<{
    id: string;
    data_negociacao: string;
    proposta: string;
    status: 'pendente' | 'aceita' | 'rejeitada' | 'em_andamento';
    observacoes: string | null;
  }>;
}

export interface DebtPaymentResponseDto {
  id: string;
  divida_id: string;
  valor: number;
  data_pagamento: string;
  tipo: 'pagamento_parcial' | 'quitacao_total';
  observacoes: string | null;
  created_at: string;
}

export interface DebtNegotiationResponseDto {
  id: string;
  divida_id: string;
  data_negociacao: string;
  proposta: string;
  status: 'pendente' | 'aceita' | 'rejeitada' | 'em_andamento';
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DebtSummaryResponseDto {
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
  proximos_vencimentos: Array<{
    id: string;
    credor: string;
    valor_atual: number;
    data_vencimento: string;
  }>;
}

export interface EvolutionReportResponseDto {
  evolucao_mensal: Array<{
    mes: string;
    valor_total: number;
    total_pago: number;
    saldo_devedor: number;
  }>;
  tendencia: 'crescente' | 'decrescente' | 'estavel';
  reducao_percentual: number;
}

export interface SimulationScenarioDto {
  nome: string;
  tipo: 'pagamento_minimo' | 'quitacao_desconto' | 'parcelamento';
  valor_mensal?: number;
  desconto_percentual?: number;
  prazo_dias?: number;
  numero_parcelas?: number;
  taxa_juros?: number;
}

export interface SimulationRequestDto {
  dividas_ids: string[];
  cenarios: SimulationScenarioDto[];
  userId: string;
}

export interface SimulationResponseDto {
  simulacoes: Array<{
    cenario: string;
    valor_total_a_pagar: number;
    tempo_quitacao_meses: number;
    juros_totais: number;
    valor_mensal?: number;
    economia?: number;
  }>;
  recomendacao: string;
  justificativa: string;
}

// Query DTOs
export interface ListDebtsQueryDto {
  page: number;
  limit: number;
  status?: string;
  credor?: string;
  sort: 'valor' | 'data_vencimento' | 'created_at';
  order: 'asc' | 'desc';
  userId: string;
}

export interface EvolutionReportQueryDto {
  periodo: '3m' | '6m' | '1y' | 'all';
  userId: string;
}