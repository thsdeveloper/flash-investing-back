import { z } from 'zod';

// Schema para criação de transação de cartão de crédito
export const createCreditCardTransactionSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória').max(255, 'Descrição deve ter no máximo 255 caracteres'),
  valor: z.number().positive('Valor deve ser positivo'),
  categoria: z.string().max(100, 'Categoria deve ter no máximo 100 caracteres').optional(),
  subcategoria: z.string().max(100, 'Subcategoria deve ter no máximo 100 caracteres').optional(),
  dataCompra: z.string().datetime('Data de compra deve ser uma data válida'),
  parcelas: z.number().int().min(1, 'Parcelas deve ser no mínimo 1').max(99, 'Parcelas deve ser no máximo 99').optional().default(1),
  parcelaAtual: z.number().int().min(1, 'Parcela atual deve ser no mínimo 1').max(99, 'Parcela atual deve ser no máximo 99').optional().default(1),
  estabelecimento: z.string().max(255, 'Estabelecimento deve ter no máximo 255 caracteres').optional(),
  observacoes: z.string().max(1000, 'Observações deve ter no máximo 1000 caracteres').optional(),
  creditCardId: z.string().uuid('ID do cartão de crédito deve ser um UUID válido'),
  invoiceId: z.string().uuid('ID da fatura deve ser um UUID válido').optional(),
}).refine((data) => {
  // Validar se parcela atual não é maior que o número total de parcelas
  if (data.parcelaAtual && data.parcelas && data.parcelaAtual > data.parcelas) {
    return false;
  }
  return true;
}, {
  message: 'Parcela atual não pode ser maior que o número total de parcelas',
  path: ['parcelaAtual'],
});

// Schema para atualização de transação de cartão de crédito
export const updateCreditCardTransactionSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória').max(255, 'Descrição deve ter no máximo 255 caracteres').optional(),
  valor: z.number().positive('Valor deve ser positivo').optional(),
  categoria: z.string().max(100, 'Categoria deve ter no máximo 100 caracteres').optional(),
  subcategoria: z.string().max(100, 'Subcategoria deve ter no máximo 100 caracteres').optional(),
  dataCompra: z.string().datetime('Data de compra deve ser uma data válida').optional(),
  parcelas: z.number().int().min(1, 'Parcelas deve ser no mínimo 1').max(99, 'Parcelas deve ser no máximo 99').optional(),
  parcelaAtual: z.number().int().min(1, 'Parcela atual deve ser no mínimo 1').max(99, 'Parcela atual deve ser no máximo 99').optional(),
  estabelecimento: z.string().max(255, 'Estabelecimento deve ter no máximo 255 caracteres').optional(),
  observacoes: z.string().max(1000, 'Observações deve ter no máximo 1000 caracteres').optional(),
  creditCardId: z.string().uuid('ID do cartão de crédito deve ser um UUID válido').optional(),
  invoiceId: z.string().uuid('ID da fatura deve ser um UUID válido').optional(),
}).refine((data) => {
  // Validar se parcela atual não é maior que o número total de parcelas
  if (data.parcelaAtual && data.parcelas && data.parcelaAtual > data.parcelas) {
    return false;
  }
  return true;
}, {
  message: 'Parcela atual não pode ser maior que o número total de parcelas',
  path: ['parcelaAtual'],
});

// Schema para parâmetros de ID da transação
export const transactionIdParamsSchema = z.object({
  id: z.string().uuid('ID da transação deve ser um UUID válido'),
});

// Schema para filtros de transações de cartão de crédito
export const creditCardTransactionFiltersSchema = z.object({
  creditCardId: z.string().uuid('ID do cartão de crédito deve ser um UUID válido').optional(),
  categoria: z.string().max(100, 'Categoria deve ter no máximo 100 caracteres').optional(),
  dataInicio: z.string().datetime('Data de início deve ser uma data válida').optional(),
  dataFim: z.string().datetime('Data de fim deve ser uma data válida').optional(),
  search: z.string().max(255, 'Busca deve ter no máximo 255 caracteres').optional(),
}).refine((data) => {
  // Validar se data de início não é maior que data de fim
  if (data.dataInicio && data.dataFim && new Date(data.dataInicio) > new Date(data.dataFim)) {
    return false;
  }
  return true;
}, {
  message: 'Data de início não pode ser maior que data de fim',
  path: ['dataInicio'],
});

// Schema para resposta de transação de cartão de crédito
export const creditCardTransactionResponseSchema = z.object({
  id: z.string().uuid(),
  descricao: z.string(),
  valor: z.number(),
  categoria: z.string().nullable(),
  subcategoria: z.string().nullable(),
  dataCompra: z.string().datetime(),
  parcelas: z.number().int(),
  parcelaAtual: z.number().int(),
  estabelecimento: z.string().nullable(),
  observacoes: z.string().nullable(),
  creditCardId: z.string().uuid(),
  invoiceId: z.string().uuid().nullable(),
  userId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Campos calculados
  isParcelada: z.boolean(),
  isUltimaParcela: z.boolean(),
  parcelaDescricao: z.string(),
  valorParcela: z.number(),
  valorTotal: z.number(),
});

// Schema para lista de transações de cartão de crédito
export const creditCardTransactionListSchema = z.object({
  data: z.array(creditCardTransactionResponseSchema),
  meta: z.object({
    total_count: z.number(),
    filter_count: z.number(),
  }),
});