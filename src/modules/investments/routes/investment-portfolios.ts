import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware } from '@src/modules/shared/infrastructure/middlewares/auth-middleware';
import { AuthenticatedRequest } from '@src/modules/shared/types/authenticated-request';
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
        201: baseResponseSchema.extend({
          success: z.literal(true),
          data: portfolioResponseSchema
        }),
        400: errorResponseSchema,
        401: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      try {
        const userId = authRequest.user.id;
        const body = authRequest.body as any;

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

        return reply.status(201).send({
          success: true,
          data: portfolio,
          message: 'Investment portfolio created successfully',
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
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: z.object({
            portfolios: z.array(portfolioResponseSchema),
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
      }
    },
    handler: async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      try {
        const userId = authRequest.user.id;
        const query = authRequest.query as any;

        // TODO: Implement GetInvestmentPortfoliosUseCase
        const result = {
          portfolios: [],
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
          message: 'Portfolios retrieved successfully',
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
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: portfolioResponseSchema
        }),
        404: errorResponseSchema,
        401: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      try {
        const { id } = authRequest.params as { id: string };
        const userId = authRequest.user.id;

        // TODO: Implement GetInvestmentPortfolioByIdUseCase
        return reply.status(404).send({
          success: false,
          data: null,
          message: 'Portfolio not found',
          errors: ['PORTFOLIO_NOT_FOUND'],
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
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: portfolioResponseSchema
        }),
        404: errorResponseSchema,
        401: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      try {
        const { id } = authRequest.params as { id: string };
        const userId = authRequest.user.id;
        const body = authRequest.body as any;

        // TODO: Implement UpdateInvestmentPortfolioUseCase
        return reply.status(404).send({
          success: false,
          data: null,
          message: 'Portfolio not found',
          errors: ['PORTFOLIO_NOT_FOUND'],
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
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: z.null()
        }),
        404: errorResponseSchema,
        401: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      try {
        const { id } = authRequest.params as { id: string };
        const userId = authRequest.user.id;

        // TODO: Implement DeleteInvestmentPortfolioUseCase
        return reply.status(404).send({
          success: false,
          data: null,
          message: 'Portfolio not found',
          errors: ['PORTFOLIO_NOT_FOUND'],
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

export default investmentPortfoliosRoutes;
export const autoPrefix = '/investment-portfolios';