import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware } from '@src/modules/shared/infrastructure/middlewares/auth-middleware';
import { AuthenticatedRequest } from '@src/modules/shared/types/authenticated-request';
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

// Portfolio response schema usando Zod
const portfolioResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  totalValue: z.number(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const investmentPortfoliosRoutes: FastifyPluginAsync = async function (fastify) {
  // Create portfolio
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Create a new investment portfolio',
      tags: ['Investment Portfolios'],
      security: [{ bearerAuth: [] }],
      body: z.object({
        name: z.string().min(1).max(255),
        description: z.string().max(1000).optional()
      }),
      response: {
        201: standardSuccessResponseSchema(portfolioResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const userId = request.user.id;
        const body = request.body;

        // TODO: Implement CreateInvestmentPortfolioUseCase
        const portfolio = {
          id: crypto.randomUUID(),
          userId,
          name: body.name,
          description: body.description || null,
          totalValue: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const response = ResponseHelper.success(
          portfolio,
          { message: 'Portfólio de investimento criado com sucesso' }
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

  // List user portfolios
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'List user investment portfolios',
      tags: ['Investment Portfolios'],
      security: [{ bearerAuth: [] }],
      querystring: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20)
      }),
      response: {
        200: standardPaginatedResponseSchema(portfolioResponseSchema),
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const userId = request.user.id;
        const query = request.query;

        // TODO: Implement GetInvestmentPortfoliosUseCase
        const portfolios: any[] = [];
        const currentPage = query.page || 1;
        const itemsPerPage = query.limit || 20;
        
        const response = ResponseHelper.successPaginated(
          portfolios,
          currentPage,
          0, // totalPages
          0, // totalItems
          itemsPerPage,
          { message: 'Portfólios recuperados com sucesso' }
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

  // Get portfolio by ID
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Get investment portfolio by ID',
      tags: ['Investment Portfolios'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string().uuid()
      }),
      response: {
        200: standardSuccessResponseSchema(portfolioResponseSchema),
        404: standardError404Schema,
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const { id } = request.params as { id: string };
        const userId = request.user.id;

        // TODO: Implement GetInvestmentPortfolioByIdUseCase
        const response = ResponseHelper.notFound('Portfólio');
        return reply.status(404).send(response);
      } catch (error) {
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : undefined
        );
        return reply.status(500).send(response);
      }
    },
  });

  // Update portfolio
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Update investment portfolio',
      tags: ['Investment Portfolios'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        name: z.string().min(1).max(255).optional(),
        description: z.string().max(1000).optional()
      }),
      response: {
        200: standardSuccessResponseSchema(portfolioResponseSchema),
        404: standardError404Schema,
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const { id } = request.params as { id: string };
        const userId = request.user.id;
        const body = request.body;

        // TODO: Implement UpdateInvestmentPortfolioUseCase
        const response = ResponseHelper.notFound('Portfólio');
        return reply.status(404).send(response);
      } catch (error) {
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : undefined
        );
        return reply.status(500).send(response);
      }
    },
  });

  // Delete portfolio
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Delete investment portfolio',
      tags: ['Investment Portfolios'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string().uuid()
      }),
      response: {
        200: standardSuccessResponseSchema(z.null()),
        404: standardError404Schema,
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const { id } = request.params as { id: string };
        const userId = request.user.id;

        // TODO: Implement DeleteInvestmentPortfolioUseCase
        const response = ResponseHelper.notFound('Portfólio');
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

export default investmentPortfoliosRoutes;
export const autoPrefix = '/investment-portfolios';