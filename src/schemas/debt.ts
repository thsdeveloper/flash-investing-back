import { z } from 'zod';

// Debt Type Enum
export const debtTypeSchema = z.enum([
  'cartao_credito',
  'emprestimo_pessoal', 
  'financiamento',
  'cheque_especial',
  'outros'
]);

// Debt Status Enum
export const debtStatusSchema = z.enum([
  'ativa',
  'quitada',
  'em_negociacao',
  'vencida'
]);

// Payment Type Enum
export const debtPaymentTypeSchema = z.enum([
  'pagamento_parcial',
  'quitacao_total'
]);

// Negotiation Status Enum
export const debtNegotiationStatusSchema = z.enum([
  'pendente',
  'aceita',
  'rejeitada',
  'em_andamento'
]);

// Create Debt Schema
export const createDebtSchema = z.object({
  credor: z.string().min(1).max(255),
  tipo_divida: debtTypeSchema,
  valor_original: z.number().positive(),
  taxa_juros: z.number().min(0).max(100).optional(),
  data_vencimento: z.string().transform((str) => new Date(str.trim())),
  descricao: z.string().max(500).optional(),
  parcelas_total: z.number().positive().optional(),
  valor_parcela: z.number().positive().optional()
});

// Update Debt Schema
export const updateDebtSchema = z.object({
  credor: z.string().min(1).max(255).optional(),
  taxa_juros: z.number().min(0).max(100).optional(),
  data_vencimento: z.string().transform((str) => new Date(str)).refine((date) => date > new Date(), {
    message: 'Data de vencimento deve ser futura'
  }).optional(),
  descricao: z.string().max(500).optional(),
  status: debtStatusSchema.optional()
});

// Debt Response Schema
export const debtResponseSchema = z.object({
  id: z.string().uuid(),
  credor: z.string(),
  tipo_divida: debtTypeSchema,
  valor_original: z.number(),
  valor_atual: z.number(),
  taxa_juros: z.number().nullable(),
  data_vencimento: z.string(),
  status: debtStatusSchema,
  descricao: z.string().nullable(),
  parcelas_total: z.number().nullable(),
  valor_parcela: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

// Debt with Relations Response Schema
export const debtWithRelationsResponseSchema = debtResponseSchema.extend({
  pagamentos: z.array(z.object({
    id: z.string().uuid(),
    valor: z.number(),
    data_pagamento: z.string(),
    tipo: debtPaymentTypeSchema,
    observacoes: z.string().nullable()
  })),
  negociacoes: z.array(z.object({
    id: z.string().uuid(),
    data_negociacao: z.string(),
    proposta: z.string(),
    status: debtNegotiationStatusSchema,
    observacoes: z.string().nullable()
  }))
});

// Create Payment Schema
export const createDebtPaymentSchema = z.object({
  valor: z.number().positive(),
  data_pagamento: z.string().transform((str) => new Date(str)).refine((date) => date <= new Date(), {
    message: 'Data do pagamento não pode ser futura'
  }),
  tipo: debtPaymentTypeSchema,
  observacoes: z.string().max(500).optional()
});

// Payment Response Schema
export const debtPaymentResponseSchema = z.object({
  id: z.string().uuid(),
  divida_id: z.string().uuid(),
  valor: z.number(),
  data_pagamento: z.string(),
  tipo: debtPaymentTypeSchema,
  observacoes: z.string().nullable(),
  created_at: z.string()
});

// Create Negotiation Schema
export const createDebtNegotiationSchema = z.object({
  data_negociacao: z.string().transform((str) => new Date(str)),
  proposta: z.string().min(1).max(1000),
  status: debtNegotiationStatusSchema,
  observacoes: z.string().max(500).optional()
});

// Update Negotiation Schema
export const updateDebtNegotiationSchema = z.object({
  status: debtNegotiationStatusSchema,
  observacoes: z.string().max(500).optional()
});

// Negotiation Response Schema
export const debtNegotiationResponseSchema = z.object({
  id: z.string().uuid(),
  divida_id: z.string().uuid(),
  data_negociacao: z.string(),
  proposta: z.string(),
  status: debtNegotiationStatusSchema,
  observacoes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

// Query Parameters for List Debts
export const listDebtsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: debtStatusSchema.optional(),
  credor: z.string().optional(),
  sort: z.enum(['valor', 'data_vencimento', 'created_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
});

// Query Parameters for Evolution Report
export const evolutionReportQuerySchema = z.object({
  periodo: z.enum(['3m', '6m', '1y', 'all']).default('6m')
});

// Debt Summary Response Schema
export const debtSummaryResponseSchema = z.object({
  total_dividas: z.number(),
  valor_total_original: z.number(),
  valor_total_atual: z.number(),
  total_pago: z.number(),
  dividas_por_status: z.object({
    ativa: z.number(),
    em_negociacao: z.number(),
    quitada: z.number()
  }),
  dividas_por_tipo: z.record(z.string(), z.number()),
  proximos_vencimentos: z.array(z.object({
    id: z.string().uuid(),
    credor: z.string(),
    valor_atual: z.number(),
    data_vencimento: z.string()
  }))
});

// Evolution Report Response Schema
export const evolutionReportResponseSchema = z.object({
  evolucao_mensal: z.array(z.object({
    mes: z.string(),
    valor_total: z.number(),
    total_pago: z.number(),
    saldo_devedor: z.number()
  })),
  tendencia: z.enum(['crescente', 'decrescente', 'estavel']),
  reducao_percentual: z.number()
});

// Simulation Schema
export const simulationRequestSchema = z.object({
  dividas_ids: z.array(z.string().uuid()),
  cenarios: z.array(z.object({
    nome: z.string(),
    tipo: z.enum(['pagamento_minimo', 'quitacao_desconto', 'parcelamento']),
    valor_mensal: z.number().positive().optional(),
    desconto_percentual: z.number().min(0).max(100).optional(),
    prazo_dias: z.number().positive().optional(),
    numero_parcelas: z.number().positive().optional(),
    taxa_juros: z.number().min(0).max(100).optional()
  }))
});

// Simulation Response Schema
export const simulationResponseSchema = z.object({
  simulacoes: z.array(z.object({
    cenario: z.string(),
    valor_total_a_pagar: z.number(),
    tempo_quitacao_meses: z.number(),
    juros_totais: z.number(),
    valor_mensal: z.number().optional(),
    economia: z.number().optional()
  })),
  recomendacao: z.string(),
  justificativa: z.string()
});

// Types derived from schemas
export type CreateDebtInput = z.infer<typeof createDebtSchema>;
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>;
export type DebtResponse = z.infer<typeof debtResponseSchema>;
export type DebtWithRelationsResponse = z.infer<typeof debtWithRelationsResponseSchema>;
export type CreateDebtPaymentInput = z.infer<typeof createDebtPaymentSchema>;
export type DebtPaymentResponse = z.infer<typeof debtPaymentResponseSchema>;
export type CreateDebtNegotiationInput = z.infer<typeof createDebtNegotiationSchema>;
export type UpdateDebtNegotiationInput = z.infer<typeof updateDebtNegotiationSchema>;
export type DebtNegotiationResponse = z.infer<typeof debtNegotiationResponseSchema>;
export type ListDebtsQuery = z.infer<typeof listDebtsQuerySchema>;
export type EvolutionReportQuery = z.infer<typeof evolutionReportQuerySchema>;
export type DebtSummaryResponse = z.infer<typeof debtSummaryResponseSchema>;
export type EvolutionReportResponse = z.infer<typeof evolutionReportResponseSchema>;
export type SimulationRequest = z.infer<typeof simulationRequestSchema>;
export type SimulationResponse = z.infer<typeof simulationResponseSchema>;