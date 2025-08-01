import { z } from 'zod';

// Schemas comuns reutilizáveis (formato antigo - mantido para compatibilidade)
export const errorResponseSchema = z.object({
  error: z.string().describe('Mensagem de erro')
});

export const successResponseSchema = z.object({
  message: z.string().describe('Mensagem de sucesso')
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1).describe('Número da página'),
  limit: z.number().int().positive().max(100).default(20).describe('Limite de itens por página'),
  offset: z.number().int().nonnegative().default(0).describe('Número de itens para pular')
});

export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional().describe('Data de início'),
  endDate: z.coerce.date().optional().describe('Data de fim')
});

export const idParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido').describe('ID do recurso')
});

// ===== NOVOS SCHEMAS PADRONIZADOS =====

/**
 * Schema base para todas as respostas padronizadas da API
 */
export const baseApiResponseSchema = z.object({
  success: z.boolean().describe('Indica se a operação foi bem-sucedida'),
  message: z.string().describe('Mensagem descritiva da operação'),
  errors: z.array(z.string()).nullable().describe('Lista de erros, se houver'),
  meta: z.object({
    timestamp: z.string().datetime().describe('Timestamp da resposta'),
    version: z.string().describe('Versão da API')
  }).describe('Metadados da resposta')
});

/**
 * Schema para respostas de sucesso
 */
export const standardSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  baseApiResponseSchema.extend({
    success: z.literal(true),
    data: dataSchema,
    errors: z.null()
  });

/**
 * Schema para respostas de erro
 */
export const standardErrorResponseSchema = baseApiResponseSchema.extend({
  success: z.literal(false),
  data: z.null(),
  errors: z.array(z.string())
});

/**
 * Schema para paginação padronizada
 */
export const standardPaginationSchema = z.object({
  current_page: z.number().int().positive().describe('Página atual'),
  total_pages: z.number().int().nonnegative().describe('Total de páginas'),
  total_items: z.number().int().nonnegative().describe('Total de itens'),
  items_per_page: z.number().int().positive().describe('Itens por página')
});

/**
 * Schema para respostas paginadas
 */
export const standardPaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  baseApiResponseSchema.extend({
    success: z.literal(true),
    data: z.object({
      items: z.array(itemSchema).describe('Lista de itens'),
      pagination: standardPaginationSchema
    }),
    errors: z.null()
  });

/**
 * Schemas de erro padronizados para diferentes status codes
 */
export const standardError400Schema = standardErrorResponseSchema.describe('Erro de validação (400)');
export const standardError401Schema = standardErrorResponseSchema.describe('Não autorizado (401)');
export const standardError403Schema = standardErrorResponseSchema.describe('Acesso negado (403)');
export const standardError404Schema = standardErrorResponseSchema.describe('Recurso não encontrado (404)');
export const standardError422Schema = standardErrorResponseSchema.describe('Entidade não processável (422)');
export const standardError500Schema = standardErrorResponseSchema.describe('Erro interno do servidor (500)');