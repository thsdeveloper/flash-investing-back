import { z } from 'zod';

export const assetTypeSchema = z.enum(['STOCK', 'BOND', 'FUND', 'ETF', 'REIT', 'CRYPTO', 'COMMODITY']);
export const assetRiskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']);

export const createInvestmentAssetSchema = z.object({
  symbol: z.string().min(1).max(20).toUpperCase(),
  name: z.string().min(1).max(255),
  type: assetTypeSchema,
  riskLevel: assetRiskLevelSchema,
  sector: z.string().max(100).optional(),
  currentPrice: z.number().positive(),
  currency: z.string().length(3).toUpperCase().default('BRL'),
  isActive: z.boolean().default(true),
});

export const updateInvestmentAssetSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  riskLevel: assetRiskLevelSchema.optional(),
  sector: z.string().max(100).optional(),
  currentPrice: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export const investmentAssetResponseSchema = z.object({
  id: z.string().uuid(),
  symbol: z.string(),
  name: z.string(),
  type: assetTypeSchema,
  riskLevel: assetRiskLevelSchema,
  sector: z.string().optional(),
  currentPrice: z.number(),
  currency: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const investmentAssetParamsSchema = z.object({
  id: z.string().uuid(),
});

export const investmentAssetQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: assetTypeSchema.optional(),
  riskLevel: assetRiskLevelSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type CreateInvestmentAssetInput = z.infer<typeof createInvestmentAssetSchema>;
export type UpdateInvestmentAssetInput = z.infer<typeof updateInvestmentAssetSchema>;
export type InvestmentAssetResponse = z.infer<typeof investmentAssetResponseSchema>;
export type InvestmentAssetParams = z.infer<typeof investmentAssetParamsSchema>;
export type InvestmentAssetQuery = z.infer<typeof investmentAssetQuerySchema>;