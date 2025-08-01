import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { authMiddleware } from '@src/modules/shared/infrastructure/middlewares/auth-middleware';
import { AuthenticatedRequest } from '@src/modules/shared/types/authenticated-request';
import { idParamsSchema, standardSuccessResponseSchema, standardPaginatedResponseSchema, standardError400Schema, standardError401Schema, standardError404Schema, standardError500Schema } from '@src/modules/shared/schemas/common';
import { ResponseHelper } from '@src/modules/shared/utils/response-helper';
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
import { DomainError } from "@src/modules/shared/domain/errors/domain-error";
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
        201: standardSuccessResponseSchema(creditCardTransactionResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        500: standardError500Schema
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
        
        const response = ResponseHelper.success(
          result,
          { message: 'Transação de cartão de crédito criada com sucesso' }
        );
        
        return reply.status(201).send(response);
      } catch (error: any) {
        if (error instanceof DomainError) {
          const response = ResponseHelper.error(error.message, ['TRANSACTION_CREATION_ERROR']);
          return reply.status(400).send(response);
        }
        const response = ResponseHelper.internalServerError(error);
        return reply.status(500).send(response);
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
        200: standardSuccessResponseSchema(creditCardTransactionListSchema),
        401: standardError401Schema,
        500: standardError500Schema
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
        
        const response = ResponseHelper.success(
          result,
          { message: 'Transações de cartão de crédito recuperadas com sucesso' }
        );
        
        return reply.status(200).send(response);
      } catch (error: any) {
        const response = ResponseHelper.internalServerError(error);
        return reply.status(500).send(response);
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
        200: standardSuccessResponseSchema(creditCardTransactionResponseSchema),
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
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
        
        if (!result) {
          const response = ResponseHelper.notFound('Transação de cartão de crédito');
          return reply.status(404).send(response);
        }
        
        const response = ResponseHelper.success(
          result,
          { message: 'Transação de cartão de crédito encontrada com sucesso' }
        );
        
        return reply.status(200).send(response);
      } catch (error: any) {
        if (error.message && error.message.includes('não encontrada')) {
          const response = ResponseHelper.notFound('Transação de cartão de crédito');
          return reply.status(404).send(response);
        }
        const response = ResponseHelper.internalServerError(error);
        return reply.status(500).send(response);
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
        200: standardSuccessResponseSchema(creditCardTransactionResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
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
        
        const response = ResponseHelper.success(
          result,
          { message: 'Transação de cartão de crédito atualizada com sucesso' }
        );
        
        return reply.status(200).send(response);
      } catch (error: any) {
        if (error.message && error.message.includes('não encontrada')) {
          const response = ResponseHelper.notFound('Transação de cartão de crédito');
          return reply.status(404).send(response);
        }
        if (error instanceof DomainError) {
          const response = ResponseHelper.error(error.message, ['TRANSACTION_UPDATE_ERROR']);
          return reply.status(400).send(response);
        }
        const response = ResponseHelper.internalServerError(error);
        return reply.status(500).send(response);
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
        200: standardSuccessResponseSchema(z.null()),
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
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
        
        const response = ResponseHelper.success(
          null,
          { message: 'Transação de cartão de crédito deletada com sucesso' }
        );
        
        return reply.status(200).send(response);
      } catch (error: any) {
        if (error.message && error.message.includes('não encontrada')) {
          const response = ResponseHelper.notFound('Transação de cartão de crédito');
          return reply.status(404).send(response);
        }
        const response = ResponseHelper.internalServerError(error);
        return reply.status(500).send(response);
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
        200: standardSuccessResponseSchema(z.array(creditCardTransactionResponseSchema)),
        401: standardError401Schema,
        500: standardError500Schema
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
        
        const response = ResponseHelper.success(
          result,
          { message: 'Transações do cartão de crédito recuperadas com sucesso' }
        );
        
        return reply.status(200).send(response);
      } catch (error: any) {
        const response = ResponseHelper.internalServerError(error);
        return reply.status(500).send(response);
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
        200: standardSuccessResponseSchema(z.array(creditCardTransactionResponseSchema)),
        401: standardError401Schema,
        500: standardError500Schema
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
        
        const response = ResponseHelper.success(
          result,
          { message: 'Transações da fatura recuperadas com sucesso' }
        );
        
        return reply.status(200).send(response);
      } catch (error: any) {
        const response = ResponseHelper.internalServerError(error);
        return reply.status(500).send(response);
      }
    }
  });
};

export default creditCardTransactionRoutes;
// Sem autoPrefix pois será registrado via index.ts