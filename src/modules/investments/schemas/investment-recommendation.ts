import { z } from 'zod';

export const recommendationTypeSchema = z.enum(['BUY', 'SELL', 'HOLD', 'STRONG_BUY', 'STRONG_SELL']);
export const recommendationReasonSchema = z.enum([
  'TECHNICAL_ANALYSIS',
  'FUNDAMENTAL_ANALYSIS', 
  'MARKET_CONDITIONS',
  'RISK_MANAGEMENT',
  'PORTFOLIO_REBALANCING',
  'DIVERSIFICATION'
]);

export const createInvestmentRecommendationSchema = z.object({
  userId: z.string().uuid(),
  assetId: z.string().uuid(),
  type: recommendationTypeSchema,
  reason: recommendationReasonSchema,
  targetPrice: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  confidence: z.number().min(0).max(100),
  description: z.string().min(1).max(1000),
  isActive: z.boolean().default(true),
  expiresAt: z.coerce.date().optional(),
});

export const updateInvestmentRecommendationSchema = z.object({
  type: recommendationTypeSchema.optional(),
  reason: recommendationReasonSchema.optional(),
  targetPrice: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  confidence: z.number().min(0).max(100).optional(),
  description: z.string().min(1).max(1000).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.coerce.date().optional(),
});

export const investmentRecommendationResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  assetId: z.string().uuid(),
  type: recommendationTypeSchema,
  reason: recommendationReasonSchema,
  targetPrice: z.number().optional(),
  stopLoss: z.number().optional(),
  confidence: z.number(),
  description: z.string(),
  isActive: z.boolean(),
  expiresAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const investmentRecommendationParamsSchema = z.object({
  id: z.string().uuid(),
});

export const investmentRecommendationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: recommendationTypeSchema.optional(),
  reason: recommendationReasonSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  assetId: z.string().uuid().optional(),
});

export type CreateInvestmentRecommendationInput = z.infer<typeof createInvestmentRecommendationSchema>;
export type UpdateInvestmentRecommendationInput = z.infer<typeof updateInvestmentRecommendationSchema>;
export type InvestmentRecommendationResponse = z.infer<typeof investmentRecommendationResponseSchema>;
export type InvestmentRecommendationParams = z.infer<typeof investmentRecommendationParamsSchema>;
export type InvestmentRecommendationQuery = z.infer<typeof investmentRecommendationQuerySchema>;