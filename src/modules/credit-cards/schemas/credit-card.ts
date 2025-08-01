import { z } from 'zod';

export const createCreditCardSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  bandeira: z.enum(['visa', 'mastercard', 'elo', 'american_express', 'diners', 'hipercard', 'outros']),
  ultimosDigitos: z.string()
    .regex(/^\d{4}$/, 'Deve conter exatamente 4 dígitos')
    .length(4, 'Deve conter exatamente 4 dígitos'),
  limiteTotal: z.number()
    .min(1, 'Limite deve ser maior que zero')
    .max(1000000, 'Limite muito alto'),
  diaVencimento: z.number()
    .int('Dia deve ser um número inteiro')
    .min(1, 'Dia deve estar entre 1 e 31')
    .max(31, 'Dia deve estar entre 1 e 31'),
  diaFechamento: z.number()
    .int('Dia deve ser um número inteiro')
    .min(1, 'Dia deve estar entre 1 e 31')
    .max(31, 'Dia deve estar entre 1 e 31'),
  contaFinanceiraId: z.string().uuid('ID da conta financeira inválido'),
  banco: z.string().optional(),
  cor: z.string().optional(),
  ativo: z.boolean().optional().default(true),
  observacoes: z.string().optional(),
});

export const updateCreditCardSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo').optional(),
  bandeira: z.enum(['visa', 'mastercard', 'elo', 'american_express', 'diners', 'hipercard', 'outros']).optional(),
  ultimosDigitos: z.string()
    .regex(/^\d{4}$/, 'Deve conter exatamente 4 dígitos')
    .length(4, 'Deve conter exatamente 4 dígitos')
    .optional(),
  limiteTotal: z.number()
    .min(1, 'Limite deve ser maior que zero')
    .max(1000000, 'Limite muito alto')
    .optional(),
  diaVencimento: z.number()
    .int('Dia deve ser um número inteiro')
    .min(1, 'Dia deve estar entre 1 e 31')
    .max(31, 'Dia deve estar entre 1 e 31')
    .optional(),
  diaFechamento: z.number()
    .int('Dia deve ser um número inteiro')
    .min(1, 'Dia deve estar entre 1 e 31')
    .max(31, 'Dia deve estar entre 1 e 31')
    .optional(),
  contaFinanceiraId: z.string().uuid('ID da conta financeira inválido').optional(),
  banco: z.string().optional(),
  cor: z.string().optional(),
  ativo: z.boolean().optional(),
  observacoes: z.string().optional(),
});

export const creditCardResponseSchema = z.object({
  id: z.string(),
  nome: z.string(),
  bandeira: z.string(),
  ultimosDigitos: z.string(),
  limiteTotal: z.number(),
  limiteDisponivel: z.number(),
  diaVencimento: z.number(),
  diaFechamento: z.number(),
  banco: z.string().optional(),
  cor: z.string().optional(),
  ativo: z.boolean(),
  observacoes: z.string().optional(),
  percentualUso: z.number(),
  valorUtilizado: z.number(),
  melhorDiaCompra: z.number(),
  prazoMaximoPagamento: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const creditCardUsageSchema = z.object({
  totalCards: z.number(),
  totalLimit: z.number(),
  totalUsed: z.number(),
  totalAvailable: z.number(),
  averageUsagePercentage: z.number(),
  cardsNearLimit: z.number(),
  inactiveCards: z.number(),
});

export const limitUpdateSchema = z.object({
  valor: z.number().min(0, 'Valor deve ser positivo'),
});

export const cardIdParamsSchema = z.object({
  id: z.string().uuid('ID inválido'),
});