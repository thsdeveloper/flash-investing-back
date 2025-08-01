import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { authMiddleware } from '@src/modules/shared/infrastructure/middlewares/auth-middleware';
import { AuthenticatedRequest } from '@src/modules/shared/types/authenticated-request';
import { errorResponseSchema, idParamsSchema } from '@src/modules/shared/schemas/common';
import { 
  createCreditCardTransactionSchema, 
  updateCreditCardTransactionSchema, 
  transactionIdParamsSchema,
  creditCardTransactionFiltersSchema,
  creditCardTransactionResponseSchema,
  creditCardTransactionListSchema
} from '../schemas/credit-card-transaction';
import {prisma} from "@src/infrastructure/database/prisma-client";
import {
  PrismaCreditCardRepository
} from "@src/modules/credit-cards/infrastructure/repositories/prisma-credit-card-repository";
import {
  PrismaCreditCardTransactionRepository
} from "@src/modules/credit-cards/infrastructure/repositories/prisma-credit-card-transaction-repository";
import {
  CreateCreditCardTransactionUseCase
} from "@src/modules/credit-cards/application/use-cases/create-credit-card-transaction";
import {DomainError} from "@src/modules/shared/domain/errors/domain-error";
import {
  GetCreditCardTransactionsUseCase
} from "@src/modules/credit-cards/application/use-cases/get-credit-card-transactions";
import {
  GetCreditCardTransactionByIdUseCase
} from "@src/modules/credit-cards/application/use-cases/get-credit-card-transaction-by-id";
import {
  UpdateCreditCardTransactionUseCase
} from "@src/modules/credit-cards/application/use-cases/update-credit-card-transaction";
import {
  DeleteCreditCardTransactionUseCase
} from "@src/modules/credit-cards/application/use-cases/delete-credit-card-transaction";

const creditCardTransactionRoutes: FastifyPluginAsync = async function (fastify) {
  const creditCardTransactionRepository = new PrismaCreditCardTransactionRepository(prisma);
  const creditCardRepository = new PrismaCreditCardRepository(prisma);

  // Criar transação de cartão de crédito
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Criar uma nova transação de cartão de crédito',
      tags: ['Credit Card Transactions'],
      security: [{ bearerAuth: [] }],
      body: createCreditCardTransactionSchema,
      response: {
        201: creditCardTransactionResponseSchema,
        400: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const createUseCase = new CreateCreditCardTransactionUseCase(
          creditCardTransactionRepository,
          creditCardRepository
        );
        
        const body = request.body as any;
        const result = await createUseCase.execute({
          ...body,
          dataCompra: new Date(body.dataCompra),
          userId: (request as AuthenticatedRequest).user.id,
        });
        
        return reply.status(201).send(result);
      } catch (error: any) {
        if (error instanceof DomainError) {
          return reply.status(400).send({ error: error.message });
        }
        return reply.status(400).send({ error: error.message });
      }
    }
  });

  // Listar transações de cartão de crédito
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Listar todas as transações de cartão de crédito do usuário',
      tags: ['Credit Card Transactions'],
      security: [{ bearerAuth: [] }],
      querystring: creditCardTransactionFiltersSchema,
      response: {
        200: creditCardTransactionListSchema,
        401: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const getTransactionsUseCase = new GetCreditCardTransactionsUseCase(
          creditCardTransactionRepository
        );
        
        const query = request.query as any;
        const filters = {
          creditCardId: query.creditCardId,
          categoria: query.categoria,
          dataInicio: query.dataInicio ? new Date(query.dataInicio) : undefined,
          dataFim: query.dataFim ? new Date(query.dataFim) : undefined,
          search: query.search,
        };
        
        // Remover filtros undefined
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined)
        );
        
        const result = await getTransactionsUseCase.execute(
          (request as AuthenticatedRequest).user.id,
          Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined
        );
        
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  });

  // Buscar transação de cartão de crédito por ID
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Buscar transação de cartão de crédito por ID',
      tags: ['Credit Card Transactions'],
      security: [{ bearerAuth: [] }],
      params: transactionIdParamsSchema,
      response: {
        200: creditCardTransactionResponseSchema,
        404: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const getTransactionByIdUseCase = new GetCreditCardTransactionByIdUseCase(
          creditCardTransactionRepository
        );
        
        const result = await getTransactionByIdUseCase.execute(
          (request as AuthenticatedRequest).user.id,
          (request.params as any).id
        );
        
        return reply.send(result);
      } catch (error: any) {
        return reply.status(404).send({ error: error.message });
      }
    }
  });

  // Atualizar transação de cartão de crédito
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Atualizar transação de cartão de crédito',
      tags: ['Credit Card Transactions'],
      security: [{ bearerAuth: [] }],
      params: transactionIdParamsSchema,
      body: updateCreditCardTransactionSchema,
      response: {
        200: creditCardTransactionResponseSchema,
        400: errorResponseSchema,
        404: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const updateUseCase = new UpdateCreditCardTransactionUseCase(
          creditCardTransactionRepository,
          creditCardRepository
        );
        
        const body = request.body as any;
        const updateData = {
          ...body,
          dataCompra: body.dataCompra ? new Date(body.dataCompra) : undefined,
        };
        
        const result = await updateUseCase.execute(
          (request as AuthenticatedRequest).user.id,
          (request.params as any).id,
          updateData
        );
        
        return reply.send(result);
      } catch (error: any) {
        if (error.message.includes('não encontrada')) {
          return reply.status(404).send({ error: error.message });
        }
        return reply.status(400).send({ error: error.message });
      }
    }
  });

  // Deletar transação de cartão de crédito
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Deletar transação de cartão de crédito',
      tags: ['Credit Card Transactions'],
      security: [{ bearerAuth: [] }],
      params: transactionIdParamsSchema,
      response: {
        204: z.null(),
        404: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const deleteUseCase = new DeleteCreditCardTransactionUseCase(
          creditCardTransactionRepository
        );
        
        await deleteUseCase.execute(
          (request as AuthenticatedRequest).user.id,
          (request.params as any).id
        );
        
        return reply.status(204).send();
      } catch (error: any) {
        return reply.status(404).send({ error: error.message });
      }
    }
  });

  // Buscar transações por cartão de crédito
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/by-credit-card/:creditCardId',
    preHandler: authMiddleware,
    schema: {
      description: 'Buscar transações por cartão de crédito',
      tags: ['Credit Card Transactions'],
      security: [{ bearerAuth: [] }],
      params: idParamsSchema.extend({
        creditCardId: z.string().uuid()
      }),
      response: {
        200: z.array(creditCardTransactionResponseSchema),
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const getTransactionsUseCase = new GetCreditCardTransactionsUseCase(
          creditCardTransactionRepository
        );
        
        const result = await getTransactionsUseCase.findByCreditCardId(
          (request.params as any).creditCardId
        );
        
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  });

  // Buscar transações por fatura
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/by-invoice/:invoiceId',
    preHandler: authMiddleware,
    schema: {
      description: 'Buscar transações por fatura',
      tags: ['Credit Card Transactions'],
      security: [{ bearerAuth: [] }],
      params: idParamsSchema.extend({
        invoiceId: z.string().uuid()
      }),
      response: {
        200: z.array(creditCardTransactionResponseSchema),
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const getTransactionsUseCase = new GetCreditCardTransactionsUseCase(
          creditCardTransactionRepository
        );
        
        const result = await getTransactionsUseCase.findByInvoiceId(
          (request.params as any).invoiceId
        );
        
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  });
};

export default creditCardTransactionRoutes;
export const autoPrefix = '/credit-card-transactions';