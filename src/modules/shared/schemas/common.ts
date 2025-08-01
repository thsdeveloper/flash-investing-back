import { z } from 'zod';

// Schemas comuns reutilizáveis
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