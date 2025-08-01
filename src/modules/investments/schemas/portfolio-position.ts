import { z } from 'zod';

export const createPortfolioPositionSchema = z.object({
  portfolioId: z.string().uuid(),
  assetId: z.string().uuid(),
  quantity: z.number().positive(),
  averagePrice: z.number().positive(),
  currentPrice: z.number().positive(),
});

export const updatePortfolioPositionSchema = z.object({
  quantity: z.number().positive().optional(),
  averagePrice: z.number().positive().optional(),
  currentPrice: z.number().positive().optional(),
});

export const addQuantitySchema = z.object({
  quantity: z.number().positive(),
  price: z.number().positive(),
});

export const removeQuantitySchema = z.object({
  quantity: z.number().positive(),
});

export const portfolioPositionResponseSchema = z.object({
  id: z.string().uuid(),
  portfolioId: z.string().uuid(),
  assetId: z.string().uuid(),
  quantity: z.number(),
  averagePrice: z.number(),
  currentPrice: z.number(),
  totalInvested: z.number(),
  currentValue: z.number(),
  profitLoss: z.number(),
  profitLossPercentage: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const portfolioPositionParamsSchema = z.object({
  id: z.string().uuid(),
});

export const portfolioPositionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  portfolioId: z.string().uuid().optional(),
  assetId: z.string().uuid().optional(),
});

export type CreatePortfolioPositionInput = z.infer<typeof createPortfolioPositionSchema>;
export type UpdatePortfolioPositionInput = z.infer<typeof updatePortfolioPositionSchema>;
export type AddQuantityInput = z.infer<typeof addQuantitySchema>;
export type RemoveQuantityInput = z.infer<typeof removeQuantitySchema>;
export type PortfolioPositionResponse = z.infer<typeof portfolioPositionResponseSchema>;
export type PortfolioPositionParams = z.infer<typeof portfolioPositionParamsSchema>;
export type PortfolioPositionQuery = z.infer<typeof portfolioPositionQuerySchema>;