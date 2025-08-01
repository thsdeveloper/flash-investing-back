import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware } from '@src/modules/shared/infrastructure/middlewares/auth-middleware';
import { AuthenticatedRequest } from '@src/modules/shared/types/authenticated-request';
import {
  createInvestmentRecommendationSchema,
  updateInvestmentRecommendationSchema,
  investmentRecommendationResponseSchema,
  investmentRecommendationParamsSchema,
  investmentRecommendationQuerySchema,
} from '../schemas/investment-recommendation';
import { 
  standardSuccessResponseSchema,
  standardPaginatedResponseSchema,
  standardError400Schema,
  standardError401Schema,
  standardError404Schema,
  standardError500Schema
} from '@src/modules/shared/schemas/common';
import { ResponseHelper } from '@src/modules/shared/utils/response-helper';
import { z } from 'zod';

// Recommendation response schema usando Zod
const recommendationResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  assetId: z.string().uuid(),
  type: z.enum(['BUY', 'SELL', 'HOLD', 'STRONG_BUY', 'STRONG_SELL']),
  reason: z.enum(['TECHNICAL_ANALYSIS', 'FUNDAMENTAL_ANALYSIS', 'MARKET_CONDITIONS', 'RISK_MANAGEMENT', 'PORTFOLIO_REBALANCING', 'DIVERSIFICATION']),
  targetPrice: z.number().nullable(),
  stopLoss: z.number().nullable(),
  confidence: z.number().min(0).max(100),
  description: z.string(),
  isActive: z.boolean(),
  expiresAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const investmentRecommendationsRoutes: FastifyPluginAsync = async function (fastify) {
  // Create recommendation
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Create a new investment recommendation',
      tags: ['Investment Recommendations'],
      security: [{ bearerAuth: [] }],
      body: createInvestmentRecommendationSchema.omit({ userId: true }),
      response: {
        201: standardSuccessResponseSchema(recommendationResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        500: standardError500Schema
      },
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const userId = request.user.id;
        const body = request.body;

        // TODO: Implement CreateInvestmentRecommendationUseCase
        const recommendation = {
          id: crypto.randomUUID(),
          userId,
          ...body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const response = ResponseHelper.success(
          recommendation,
          { message: 'Recomendação de investimento criada com sucesso' }
        );
        
        return reply.status(201).send(response);
      } catch (error) {
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : undefined
        );
        return reply.status(500).send(response);
      }
    },
  });

  // List user recommendations
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'List user investment recommendations',
      tags: ['Investment Recommendations'],
      security: [{ bearerAuth: [] }],
      querystring: investmentRecommendationQuerySchema,
      response: {
        200: standardSuccessResponseSchema(z.array(recommendationResponseSchema)),
        401: standardError401Schema,
        500: standardError500Schema
      },
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const userId = request.user.id;
        const query = request.query;

        // TODO: Implement GetInvestmentRecommendationsUseCase
        const recommendations: any[] = [];
        const currentPage = query.page || 1;
        const itemsPerPage = query.limit || 20;
        
        const response = ResponseHelper.success(
          recommendations,
          { message: 'Recomendações recuperadas com sucesso' }
        );

        return reply.send(response);
      } catch (error) {
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : undefined
        );
        return reply.status(500).send(response);
      }
    },
  });

  // Get active recommendations
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/active',
    preHandler: authMiddleware,
    schema: {
      description: 'Get active investment recommendations for user',
      tags: ['Investment Recommendations'],
      security: [{ bearerAuth: [] }],
      response: {
        200: standardSuccessResponseSchema(z.array(recommendationResponseSchema)),
        401: standardError401Schema,
        500: standardError500Schema
      },
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const userId = request.user.id;

        // TODO: Implement GetActiveInvestmentRecommendationsUseCase
        const recommendations = [];

        const response = ResponseHelper.success(
          recommendations,
          { message: 'Recomendações ativas recuperadas com sucesso' }
        );
        
        return reply.send(response);
      } catch (error) {
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : undefined
        );
        return reply.status(500).send(response);
      }
    },
  });

  // Get recommendation by ID
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Get investment recommendation by ID',
      tags: ['Investment Recommendations'],
      security: [{ bearerAuth: [] }],
      params: investmentRecommendationParamsSchema,
      response: {
        200: standardSuccessResponseSchema(recommendationResponseSchema),
        404: standardError404Schema,
        401: standardError401Schema,
        500: standardError500Schema
      },
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const { id } = request.params ;
        const userId = request.user.id;

        // TODO: Implement GetInvestmentRecommendationByIdUseCase
        const response = ResponseHelper.notFound('Recomendação');
        return reply.status(404).send(response);
      } catch (error) {
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : undefined
        );
        return reply.status(500).send(response);
      }
    },
  });

  // Update recommendation
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Update investment recommendation',
      tags: ['Investment Recommendations'],
      security: [{ bearerAuth: [] }],
      params: investmentRecommendationParamsSchema,
      body: updateInvestmentRecommendationSchema,
      response: {
        200: standardSuccessResponseSchema(recommendationResponseSchema),
        404: standardError404Schema,
        401: standardError401Schema,
        500: standardError500Schema
      },
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const { id } = request.params ;
        const userId = request.user.id;
        const body = request.body;

        // TODO: Implement UpdateInvestmentRecommendationUseCase
        const response = ResponseHelper.notFound('Recomendação');
        return reply.status(404).send(response);
      } catch (error) {
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : undefined
        );
        return reply.status(500).send(response);
      }
    },
  });

  // Activate/Deactivate recommendation
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/:id/toggle',
    preHandler: authMiddleware,
    schema: {
      description: 'Toggle investment recommendation active status',
      tags: ['Investment Recommendations'],
      security: [{ bearerAuth: [] }],
      params: investmentRecommendationParamsSchema,
      response: {
        200: standardSuccessResponseSchema(recommendationResponseSchema),
        404: standardError404Schema,
        401: standardError401Schema,
        500: standardError500Schema
      },
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const { id } = request.params ;
        const userId = request.user.id;

        // TODO: Implement ToggleInvestmentRecommendationUseCase
        const response = ResponseHelper.notFound('Recomendação');
        return reply.status(404).send(response);
      } catch (error) {
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : undefined
        );
        return reply.status(500).send(response);
      }
    },
  });
};

export default investmentRecommendationsRoutes;
export const autoPrefix = '/investment-recommendations';