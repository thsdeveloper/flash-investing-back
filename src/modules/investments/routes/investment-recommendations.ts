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
import { z } from 'zod';

// Base response schema seguindo o padrão do módulo de dívidas
const baseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  errors: z.array(z.any()).nullable(),
  meta: z.object({
    timestamp: z.string(),
    version: z.string()
  })
});

const errorResponseSchema = baseResponseSchema.extend({
  success: z.literal(false),
  data: z.null()
});

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
        201: baseResponseSchema.extend({
          success: z.literal(true),
          data: recommendationResponseSchema
        }),
        400: errorResponseSchema,
        401: errorResponseSchema,
        500: errorResponseSchema
      },
    },
    handler: async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      try {
        const userId = authRequest.user.id;
        const body = authRequest.body as any;

        // TODO: Implement CreateInvestmentRecommendationUseCase
        const recommendation = {
          id: crypto.randomUUID(),
          userId,
          ...body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return reply.status(201).send({
          success: true,
          data: recommendation,
          message: 'Investment recommendation created successfully',
          errors: null,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          data: null,
          message: 'Internal server error',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
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
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: z.object({
            recommendations: z.array(recommendationResponseSchema),
            pagination: z.object({
              current_page: z.number(),
              total_pages: z.number(),
              total_items: z.number(),
              items_per_page: z.number()
            })
          })
        }),
        401: errorResponseSchema,
        500: errorResponseSchema
      },
    },
    handler: async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      try {
        const userId = authRequest.user.id;
        const query = authRequest.query as any;

        // TODO: Implement GetInvestmentRecommendationsUseCase
        const result = {
          recommendations: [],
          pagination: {
            current_page: query.page || 1,
            total_pages: 0,
            total_items: 0,
            items_per_page: query.limit || 20
          }
        };

        return reply.send({
          success: true,
          data: result,
          message: 'Recommendations retrieved successfully',
          errors: null,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          data: null,
          message: 'Internal server error',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
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
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: z.object({
            recommendations: z.array(recommendationResponseSchema)
          })
        }),
        401: errorResponseSchema,
        500: errorResponseSchema
      },
    },
    handler: async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      try {
        const userId = authRequest.user.id;

        // TODO: Implement GetActiveInvestmentRecommendationsUseCase
        const result = { recommendations: [] };

        return reply.send({
          success: true,
          data: result,
          message: 'Active recommendations retrieved successfully',
          errors: null,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          data: null,
          message: 'Internal server error',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
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
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: recommendationResponseSchema
        }),
        404: errorResponseSchema,
        401: errorResponseSchema,
        500: errorResponseSchema
      },
    },
    handler: async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      try {
        const { id } = authRequest.params as any;
        const userId = authRequest.user.id;

        // TODO: Implement GetInvestmentRecommendationByIdUseCase
        return reply.status(404).send({
          success: false,
          data: null,
          message: 'Recommendation not found',
          errors: ['RECOMMENDATION_NOT_FOUND'],
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          data: null,
          message: 'Internal server error',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
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
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: recommendationResponseSchema
        }),
        404: errorResponseSchema,
        401: errorResponseSchema,
        500: errorResponseSchema
      },
    },
    handler: async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      try {
        const { id } = authRequest.params as any;
        const userId = authRequest.user.id;
        const body = authRequest.body as any;

        // TODO: Implement UpdateInvestmentRecommendationUseCase
        return reply.status(404).send({
          success: false,
          data: null,
          message: 'Recommendation not found',
          errors: ['RECOMMENDATION_NOT_FOUND'],
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          data: null,
          message: 'Internal server error',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
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
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: recommendationResponseSchema
        }),
        404: errorResponseSchema,
        401: errorResponseSchema,
        500: errorResponseSchema
      },
    },
    handler: async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      try {
        const { id } = authRequest.params as any;
        const userId = authRequest.user.id;

        // TODO: Implement ToggleInvestmentRecommendationUseCase
        return reply.status(404).send({
          success: false,
          data: null,
          message: 'Recommendation not found',
          errors: ['RECOMMENDATION_NOT_FOUND'],
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          data: null,
          message: 'Internal server error',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      }
    },
  });
};

export default investmentRecommendationsRoutes;
export const autoPrefix = '/investment-recommendations';