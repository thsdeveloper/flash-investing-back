import { z } from 'zod';

export const transactionTypeSchema = z.enum(['receita', 'despesa', 'transferencia']);

export const createTransactionSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória').max(255, 'Descrição deve ter no máximo 255 caracteres'),
  valor: z.number().positive('Valor deve ser positivo'),
  tipo: transactionTypeSchema,
  categoria: z.string().optional(),  // Mantido para compatibilidade
  categoriaId: z.string().uuid('ID da categoria deve ser um UUID válido').optional(),  // Nova FK
  subcategoria: z.string().optional(),
  data: z.coerce.date(),
  observacoes: z.string().optional().or(z.literal('')),
  contaFinanceiraId: z.string().uuid('ID da conta deve ser um UUID válido'),
});

export const updateTransactionSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória').max(255, 'Descrição deve ter no máximo 255 caracteres').optional(),
  valor: z.number().positive('Valor deve ser positivo').optional(),
  tipo: transactionTypeSchema.optional(),
  categoria: z.string().optional(),  // Mantido para compatibilidade
  categoriaId: z.string().uuid('ID da categoria deve ser um UUID válido').optional(),  // Nova FK
  subcategoria: z.string().optional(),
  data: z.coerce.date().optional(),
  observacoes: z.string().optional(),
  contaFinanceiraId: z.string().uuid('ID da conta deve ser um UUID válido').optional(),
});

export const transactionParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

export const transactionQuerySchema = z.object({
  contaFinanceiraId: z.string().uuid('ID da conta deve ser um UUID válido').optional(),
  categoria: z.string().optional(),
  tipo: transactionTypeSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  offset: z.coerce.number().int().nonnegative().default(0).optional(),
});

export const transactionResponseSchema = z.object({
  id: z.string().uuid(),
  descricao: z.string(),
  valor: z.number(),
  tipo: transactionTypeSchema,
  categoria: z.string().optional(),  // Mantido para compatibilidade
  categoriaId: z.string().uuid().optional(),  // Nova FK
  subcategoria: z.string().optional(),
  data: z.string(),
  observacoes: z.string().optional(),
  contaFinanceiraId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const transactionListResponseSchema = z.object({
  transactions: z.array(transactionResponseSchema),
  total: z.number(),
  totalValue: z.number(),
  summary: z.object({
    receitas: z.number(),
    despesas: z.number(),
    saldo: z.number(),
  }),
});

export const transactionStatsResponseSchema = z.object({
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  total: z.object({
    receitas: z.number(),
    despesas: z.number(),
    saldo: z.number(),
    transacoes: z.number(),
  }),
  byCategory: z.array(
    z.object({
      categoria: z.string(),
      total: z.number(),
      count: z.number(),
      percentage: z.number(),
    })
  ),
  byAccount: z.array(
    z.object({
      contaId: z.string(),
      contaNome: z.string(),
      total: z.number(),
      count: z.number(),
    })
  ),
});

export const budgetResponseSchema = z.object({
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  budget: z.object({
    necessidades: z.object({
      budget: z.number(),
      spent: z.number(),
      remaining: z.number(),
      percentage: z.number(),
    }),
    desejos: z.object({
      budget: z.number(),
      spent: z.number(),
      remaining: z.number(),
      percentage: z.number(),
    }),
    futuro: z.object({
      budget: z.number(),
      spent: z.number(),
      remaining: z.number(),
      percentage: z.number(),
    }),
    total: z.object({
      budget: z.number(),
      spent: z.number(),
      remaining: z.number(),
    }),
  }),
  hasValidSettings: z.boolean(),
  message: z.string().optional(),
});

export const budgetQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});