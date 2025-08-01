import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  createItemSchema,
  getAccountsSchema,
  getTransactionsSchema,
  connectorResponseSchema,
  itemResponseSchema,
  accountResponseSchema,
  transactionResponseSchema
} from '../schemas/pluggy';
import {
  standardSuccessResponseSchema,
  standardError400Schema,
  standardError401Schema,
  standardError404Schema,
  standardError500Schema
} from '@src/modules/shared/schemas/common';
import { ResponseHelper } from '@src/modules/shared/utils/response-helper';
import { authMiddleware } from '@src/modules/shared/infrastructure/middlewares/auth-middleware';
import { AuthenticatedRequest } from '@src/modules/shared/types/authenticated-request';
import { PluggyHttpClient } from '../infrastructure/providers/pluggy-http-client';
import { DomainError } from '@src/modules/shared/domain/errors/domain-error';

const pluggyRoutes: FastifyPluginAsync = async function (fastify) {
  const pluggyClient = new PluggyHttpClient();

  // GET /pluggy/connectors - Listar conectores disponíveis
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/connectors',
    schema: {
      description: 'Listar conectores bancários disponíveis',
      tags: ['Pluggy Integration'],
      querystring: z.object({
        sandbox: z.boolean().optional().default(false).describe('Usar ambiente sandbox')
      }),
      response: {
        200: standardSuccessResponseSchema(z.array(connectorResponseSchema)),
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const { sandbox } = request.query as { sandbox?: boolean };
        const connectors = await pluggyClient.getConnectors(sandbox);
        
        const connectorsData = connectors.map(connector => connector.toJSON());
        
        const response = ResponseHelper.success(
          connectorsData,
          { message: 'Conectores recuperados com sucesso' }
        );
        
        return reply.status(200).send(response as any as any);
      } catch (error) {
        fastify.log.error('Erro ao buscar conectores:', error);
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : new Error('Erro desconhecido')
        );
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // POST /pluggy/items - Criar novo item (conexão bancária)
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/items',
    preHandler: authMiddleware,
    schema: {
      description: 'Criar nova conexão bancária (item)',
      tags: ['Pluggy Integration'],
      security: [{ bearerAuth: [] }],
      body: createItemSchema,
      response: {
        201: standardSuccessResponseSchema(itemResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const userId = (request as AuthenticatedRequest).user.id;
        const body = request.body as any;
        const createItemData = {
          ...body,
          clientUserId: userId,
          parameters: body.parameters as Record<string, string>
        };
        
        const item = await pluggyClient.createItem(createItemData);
        
        const response = ResponseHelper.success(
          {
            id: item.id,
            connector: item.connector,
            status: item.status,
            executionStatus: item.executionStatus,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
            lastUpdatedAt: item.lastUpdatedAt?.toISOString(),
            webhookUrl: item.webhookUrl,
            clientUserId: item.clientUserId,
            consecutiveFailedUpdates: item.consecutiveFailedUpdates,
            userAction: item.userAction,
            parameter: item.parameter
          },
          { message: 'Conexão bancária criada com sucesso' }
        );
        
        return reply.status(201).send(response as any as any);
      } catch (error) {
        if (error instanceof DomainError) {
          const response = ResponseHelper.error(error.message, [error.code]);
          return reply.status(400).send(response as any as any);
        }
        
        fastify.log.error('Erro ao criar item:', error);
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : new Error('Erro desconhecido')
        );
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // GET /pluggy/items/:itemId - Obter status do item
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/items/:itemId',
    preHandler: authMiddleware,
    schema: {
      description: 'Obter status da conexão bancária',
      tags: ['Pluggy Integration'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        itemId: z.string().uuid('Item ID deve ser um UUID válido')
      }),
      response: {
        200: standardSuccessResponseSchema(itemResponseSchema),
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const { itemId } = request.params as { itemId: string };
        
        const item = await pluggyClient.getItem(itemId);
        
        const response = ResponseHelper.success(
          {
            id: item.id,
            connector: item.connector,
            status: item.status,
            executionStatus: item.executionStatus,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
            lastUpdatedAt: item.lastUpdatedAt?.toISOString(),
            webhookUrl: item.webhookUrl,
            clientUserId: item.clientUserId,
            consecutiveFailedUpdates: item.consecutiveFailedUpdates,
            userAction: item.userAction,
            parameter: item.parameter
          },
          { message: 'Status da conexão recuperado com sucesso' }
        );
        
        return reply.status(200).send(response as any as any);
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          const response = ResponseHelper.notFound('Item');
          return reply.status(404).send(response as any as any);
        }
        
        fastify.log.error('Erro ao buscar item:', error);
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : new Error('Erro desconhecido')
        );
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // PATCH /pluggy/items/:itemId - Submeter parâmetros adicionais
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/items/:itemId',
    preHandler: authMiddleware,
    schema: {
      description: 'Submeter parâmetros adicionais para a conexão',
      tags: ['Pluggy Integration'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        itemId: z.string().uuid('Item ID deve ser um UUID válido')
      }),
      body: z.object({
        parameters: z.object({}).passthrough().describe('Parâmetros adicionais')
      }),
      response: {
        200: standardSuccessResponseSchema(itemResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const { itemId } = request.params as { itemId: string };
        const { parameters } = request.body as { parameters: Record<string, string> };
        
        const item = await pluggyClient.submitParameter({ itemId, parameters });
        
        const response = ResponseHelper.success(
          {
            id: item.id,
            connector: item.connector,
            status: item.status,
            executionStatus: item.executionStatus,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
            lastUpdatedAt: item.lastUpdatedAt?.toISOString(),
            webhookUrl: item.webhookUrl,
            clientUserId: item.clientUserId,
            consecutiveFailedUpdates: item.consecutiveFailedUpdates,
            userAction: item.userAction,
            parameter: item.parameter
          },
          { message: 'Parâmetros submetidos com sucesso' }
        );
        
        return reply.status(200).send(response as any as any);
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          const response = ResponseHelper.notFound('Item');
          return reply.status(404).send(response as any as any);
        }
        
        if (error instanceof DomainError) {
          const response = ResponseHelper.error(error.message, [error.code]);
          return reply.status(400).send(response as any as any);
        }
        
        fastify.log.error('Erro ao submeter parâmetros:', error);
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : new Error('Erro desconhecido')
        );
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // POST /pluggy/items/:itemId/refresh - Atualizar item
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/items/:itemId/refresh',
    preHandler: authMiddleware,
    schema: {
      description: 'Atualizar dados da conexão bancária',
      tags: ['Pluggy Integration'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        itemId: z.string().uuid('Item ID deve ser um UUID válido')
      }),
      response: {
        200: standardSuccessResponseSchema(z.object({ message: z.string() })),
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const { itemId } = request.params as { itemId: string };
        
        await pluggyClient.refreshItem(itemId);
        
        const response = ResponseHelper.success(
          { message: 'Atualização iniciada' },
          { message: 'Atualização da conexão iniciada com sucesso' }
        );
        
        return reply.status(200).send(response as any as any);
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          const response = ResponseHelper.notFound('Item');
          return reply.status(404).send(response as any as any);
        }
        
        fastify.log.error('Erro ao atualizar item:', error);
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : new Error('Erro desconhecido')
        );
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // DELETE /pluggy/items/:itemId - Remover item
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/items/:itemId',
    preHandler: authMiddleware,
    schema: {
      description: 'Remover conexão bancária',
      tags: ['Pluggy Integration'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        itemId: z.string().uuid('Item ID deve ser um UUID válido')
      }),
      response: {
        200: standardSuccessResponseSchema(z.object({ message: z.string() })),
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const { itemId } = request.params as { itemId: string };
        
        await pluggyClient.deleteItem(itemId);
        
        const response = ResponseHelper.success(
          { message: 'Conexão removida' },
          { message: 'Conexão bancária removida com sucesso' }
        );
        
        return reply.status(200).send(response as any as any);
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          const response = ResponseHelper.notFound('Item');
          return reply.status(404).send(response as any as any);
        }
        
        fastify.log.error('Erro ao remover item:', error);
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : new Error('Erro desconhecido')
        );
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // GET /pluggy/accounts - Listar contas de um item
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/accounts',
    preHandler: authMiddleware,
    schema: {
      description: 'Listar contas bancárias de uma conexão',
      tags: ['Pluggy Integration'],
      security: [{ bearerAuth: [] }],
      querystring: getAccountsSchema,
      response: {
        200: standardSuccessResponseSchema(z.array(accountResponseSchema)),
        400: standardError400Schema,
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const { itemId } = request.query as { itemId: string };
        
        const accounts = await pluggyClient.getAccounts(itemId);
        
        const accountsData = accounts.map(account => {
          const data = account.toJSON();
          return {
            ...data,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString()
          };
        });
        
        const response = ResponseHelper.success(
          accountsData,
          { message: 'Contas recuperadas com sucesso' }
        );
        
        return reply.status(200).send(response as any as any);
      } catch (error) {
        if (error instanceof DomainError) {
          const response = ResponseHelper.error(error.message, [error.code]);
          return reply.status(400).send(response as any as any);
        }
        
        fastify.log.error('Erro ao buscar contas:', error);
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : new Error('Erro desconhecido')
        );
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // GET /pluggy/transactions - Listar transações
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/transactions',
    preHandler: authMiddleware,
    schema: {
      description: 'Listar transações de uma conta bancária',
      tags: ['Pluggy Integration'],
      security: [{ bearerAuth: [] }],
      querystring: getTransactionsSchema,
      response: {
        200: standardSuccessResponseSchema(z.array(transactionResponseSchema)),
        400: standardError400Schema,
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const { itemId, accountId, from, to } = request.query as {
          itemId: string;
          accountId?: string;
          from?: string;
          to?: string;
        };
        
        const fromDate = from ? new Date(from) : undefined;
        const toDate = to ? new Date(to) : undefined;
        
        const transactions = await pluggyClient.getTransactions(
          itemId,
          accountId,
          fromDate,
          toDate
        );
        
        const transactionsData = transactions.map(transaction => {
          const data = transaction.toJSON();
          return {
            ...data,
            date: data.date.toISOString(),
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString()
          };
        });
        
        const response = ResponseHelper.success(
          transactionsData,
          { message: 'Transações recuperadas com sucesso' }
        );
        
        return reply.status(200).send(response as any as any);
      } catch (error) {
        if (error instanceof DomainError) {
          const response = ResponseHelper.error(error.message, [error.code]);
          return reply.status(400).send(response as any as any);
        }
        
        fastify.log.error('Erro ao buscar transações:', error);
        const response = ResponseHelper.internalServerError(
          error instanceof Error ? error : new Error('Erro desconhecido')
        );
        return reply.status(500).send(response as any as any);
      }
    }
  });
};

export default pluggyRoutes;
export const autoPrefix = '/pluggy';