import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware } from '@src/modules/shared/infrastructure/middlewares/auth-middleware';
import { AuthenticatedRequest } from '@src/modules/shared/types/authenticated-request';
import {
  createInvestmentAssetSchema,
  updateInvestmentAssetSchema,
  investmentAssetResponseSchema,
  investmentAssetParamsSchema,
  investmentAssetQuerySchema,
} from '../schemas/investment-asset';
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

// Asset response schema usando Zod
const assetResponseSchema = z.object({
  id: z.string().uuid(),
  symbol: z.string(),
  name: z.string(),
  type: z.enum(['STOCK', 'BOND', 'FUND', 'ETF', 'REIT', 'CRYPTO', 'COMMODITY']),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']),
  sector: z.string().nullable(),
  currentPrice: z.number(),
  currency: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const investmentAssetsRoutes: FastifyPluginAsync = async function (fastify) {
  // Create asset (admin only - could be restricted)
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Create a new investment asset',
      tags: ['Investment Assets'],
      security: [{ bearerAuth: [] }],
      body: createInvestmentAssetSchema,
      response: {
        201: baseResponseSchema.extend({
          success: z.literal(true),
          data: assetResponseSchema
        }),
        400: errorResponseSchema,
        401: errorResponseSchema,
        500: errorResponseSchema
      },
    },
    handler: async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      try {
        const body = authRequest.body as any;

        // TODO: Implement CreateInvestmentAssetUseCase
        const asset = {
          id: crypto.randomUUID(),
          ...body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return reply.status(201).send({
          success: true,
          data: asset,
          message: 'Investment asset created successfully',
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

  // List assets
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'List investment assets',
      tags: ['Investment Assets'],
      security: [{ bearerAuth: [] }],
      querystring: investmentAssetQuerySchema,
      response: {
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: z.object({
            assets: z.array(assetResponseSchema),
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
        const query = authRequest.query as any;

        // TODO: Implement GetInvestmentAssetsUseCase
        const result = {
          assets: [],
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
          message: 'Assets retrieved successfully',
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

  // Get asset by ID
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Get investment asset by ID',
      tags: ['Investment Assets'],
      security: [{ bearerAuth: [] }],
      params: investmentAssetParamsSchema,
      response: {
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: assetResponseSchema
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

        // TODO: Implement GetInvestmentAssetByIdUseCase
        return reply.status(404).send({
          success: false,
          data: null,
          message: 'Asset not found',
          errors: ['ASSET_NOT_FOUND'],
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

  // Update asset
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Update investment asset',
      tags: ['Investment Assets'],
      security: [{ bearerAuth: [] }],
      params: investmentAssetParamsSchema,
      body: updateInvestmentAssetSchema,
      response: {
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: assetResponseSchema
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
        const body = authRequest.body as any;

        // TODO: Implement UpdateInvestmentAssetUseCase
        return reply.status(404).send({
          success: false,
          data: null,
          message: 'Asset not found',
          errors: ['ASSET_NOT_FOUND'],
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

export default investmentAssetsRoutes;
export const autoPrefix = '/investment-assets';