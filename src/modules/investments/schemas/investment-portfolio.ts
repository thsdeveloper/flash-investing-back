import { z } from 'zod';

export const createInvestmentPortfolioSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  userId: z.string().uuid(),
});

export const updateInvestmentPortfolioSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
});

export const investmentPortfolioResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  totalValue: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const investmentPortfolioParamsSchema = z.object({
  id: z.string().uuid(),
});

export const investmentPortfolioQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateInvestmentPortfolioInput = z.infer<typeof createInvestmentPortfolioSchema>;
export type UpdateInvestmentPortfolioInput = z.infer<typeof updateInvestmentPortfolioSchema>;
export type InvestmentPortfolioResponse = z.infer<typeof investmentPortfolioResponseSchema>;
export type InvestmentPortfolioParams = z.infer<typeof investmentPortfolioParamsSchema>;
export type InvestmentPortfolioQuery = z.infer<typeof investmentPortfolioQuerySchema>;