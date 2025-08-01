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
        201: standardSuccessResponseSchema(assetResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        500: standardError500Schema
      },
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const body = request.body;

        // TODO: Implement CreateInvestmentAssetUseCase
        const asset = {
          id: crypto.randomUUID(),
          ...body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const response = ResponseHelper.success(
          asset,
          { message: 'Ativo de investimento criado com sucesso' }
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
        200: standardSuccessResponseSchema(z.array(assetResponseSchema)),
        401: standardError401Schema,
        500: standardError500Schema
      },
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const query = request.query;

        // TODO: Implement GetInvestmentAssetsUseCase
        const assets: any[] = [];
        const currentPage = query.page || 1;
        const itemsPerPage = query.limit || 20;
        
        const response = ResponseHelper.success(
          assets,
          { message: 'Ativos recuperados com sucesso' }
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
        200: standardSuccessResponseSchema(assetResponseSchema),
        404: standardError404Schema,
        401: standardError401Schema,
        500: standardError500Schema
      },
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const { id } = request.params ;

        // TODO: Implement GetInvestmentAssetByIdUseCase
        const response = ResponseHelper.notFound('Ativo');
        return reply.status(404).send(response);
      } catch (error) {
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : undefined
        );
        return reply.status(500).send(response);
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
        200: standardSuccessResponseSchema(assetResponseSchema),
        404: standardError404Schema,
        401: standardError401Schema,
        500: standardError500Schema
      },
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const { id } = request.params ;
        const body = request.body;

        // TODO: Implement UpdateInvestmentAssetUseCase
        const response = ResponseHelper.notFound('Ativo');
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

export default investmentAssetsRoutes;
export const autoPrefix = '/investment-assets';