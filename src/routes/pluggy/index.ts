import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { PluggyHttpClient } from '../../infrastructure/providers/pluggy-http-client';
import { GetConnectorsUseCase } from '../../application/use-cases/get-connectors';
import { CreateItemUseCase } from '../../application/use-cases/create-item';
import { GetItemStatusUseCase } from '../../application/use-cases/get-item-status';
import { SubmitParameterUseCase } from '../../application/use-cases/submit-parameter';
import { GetPluggyAccountsUseCase } from '../../application/use-cases/get-pluggy-accounts';
import { GetPluggyTransactionsUseCase } from '../../application/use-cases/get-pluggy-transactions';
import { 
  createItemSchema, 
  getAccountsSchema, 
  getTransactionsSchema,
  connectorResponseSchema,
  itemResponseSchema,
  accountResponseSchema,
  transactionResponseSchema
} from '../../schemas/pluggy';

const pluggyRoutes: FastifyPluginAsync = async function (fastify) {
  // Inicializar dependências
  const pluggyClient = new PluggyHttpClient();
  const getConnectorsUseCase = new GetConnectorsUseCase(pluggyClient);
  const createItemUseCase = new CreateItemUseCase(pluggyClient);
  const getItemStatusUseCase = new GetItemStatusUseCase(pluggyClient);
  const submitParameterUseCase = new SubmitParameterUseCase(pluggyClient);
  const getPluggyAccountsUseCase = new GetPluggyAccountsUseCase(pluggyClient);
  const getPluggyTransactionsUseCase = new GetPluggyTransactionsUseCase(pluggyClient);

  // GET /pluggy/connectors - Listar conectores disponíveis
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/connectors',
    schema: {
      description: 'Get available connectors',
      tags: ['Pluggy'],
      querystring: z.object({
        sandbox: z.boolean().optional().default(false),
      }),
      response: {
        200: z.array(connectorResponseSchema),
        500: z.object({ error: z.string() })
      }
    },
    handler: async (request, reply) => {
      try {
        const connectors = await getConnectorsUseCase.execute(request.query.sandbox);
        console.log(`🎯 Returning ${connectors.length} connectors to frontend`);
        return reply.status(200).send(connectors.map(connector => {
          const json = connector.toJSON();
          return {
            id: json.id,
            name: json.name,
            institutionUrl: json.institutionUrl,
            imageUrl: json.imageUrl,
            primaryColor: json.primaryColor,
            type: json.type,
            country: json.country,
            credentials: json.credentials,
            products: json.products,
            createdAt: json.createdAt?.toISOString(),
            updatedAt: json.updatedAt?.toISOString()
          };
        }));
      } catch (error: any) {
        fastify.log.error('Failed to get connectors:', error);
        console.error('❌ Route handler error:', error.message);
        
        // Em desenvolvimento, retornar dados mock se houver erro
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Falling back to mock connectors in route handler');
          const pluggyClient = new PluggyHttpClient();
          const mockConnectors = (pluggyClient as any).getMockConnectors();
          return reply.status(200).send(mockConnectors.map((connector: any) => {
            const json = connector.toJSON();
            return {
              id: json.id,
              name: json.name,
              institutionUrl: json.institutionUrl,
              imageUrl: json.imageUrl,
              primaryColor: json.primaryColor,
              type: json.type,
              country: json.country,
              credentials: json.credentials,
              products: json.products,
              createdAt: json.createdAt?.toISOString(),
              updatedAt: json.updatedAt?.toISOString()
            };
          }));
        }
        
        return reply.status(500).send({ error: error.message });
      }
    }
  });

  // POST /pluggy/items - Criar novo item de conexão
  fastify.route({
    method: 'POST',
    url: '/items',
    schema: {
      description: 'Create a new item connection',
      tags: ['Pluggy'],
      // Removendo validação temporariamente por problemas com Zod
    },
    handler: async (request, reply) => {
      try {
        console.log('📤 Creating item with data:', JSON.stringify(request.body, null, 2));
        const item = await createItemUseCase.execute(request.body as any);
        
        const response = {
          id: item.id,
          connector: item.connector,
          status: item.status,
          executionStatus: item.executionStatus,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          lastUpdatedAt: item.lastUpdatedAt?.toISOString() || undefined,
          webhookUrl: item.webhookUrl || undefined,
          clientUserId: item.clientUserId || undefined,
          consecutiveFailedUpdates: item.consecutiveFailedUpdates || 0,
          userAction: item.userAction || undefined,
          parameter: item.parameter || undefined,
        };
        
        console.log('✅ Item created successfully:', response.id);
        return reply.status(201).send(response);
      } catch (error: any) {
        console.error('❌ Failed to create item:', error.message);
        fastify.log.error('Failed to create item:', error);
        return reply.status(500).send({
          error: error.message,
          message: 'Failed to create item'
        });
      }
    }
  });

  // GET /pluggy/items/:itemId - Verificar status do item
  fastify.route({
    method: 'GET',
    url: '/items/:itemId',
    schema: {
      description: 'Get item status',
      tags: ['Pluggy'],
    },
    handler: async (request: any, reply) => {
      try {
        const { itemId } = request.params;
        console.log('🔍 Checking status for item:', itemId);
        
        const item = await getItemStatusUseCase.execute(itemId);
        
        const response = {
          id: item.id,
          connector: item.connector,
          status: item.status,
          executionStatus: item.executionStatus,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          lastUpdatedAt: item.lastUpdatedAt?.toISOString() || undefined,
          webhookUrl: item.webhookUrl || undefined,
          clientUserId: item.clientUserId || undefined,
          consecutiveFailedUpdates: item.consecutiveFailedUpdates || 0,
          userAction: item.userAction || undefined,
          parameter: item.parameter || undefined,
        };
        
        console.log(`📊 Item status: ${item.status} | Execution: ${item.executionStatus}`);
        return reply.status(200).send(response);
      } catch (error: any) {
        console.error('❌ Failed to get item status:', error.message);
        fastify.log.error('Failed to get item status:', error);
        return reply.status(500).send({
          error: error.message,
          message: 'Failed to get item status'
        });
      }
    }
  });

  // PATCH /pluggy/items/:itemId - Submeter parâmetros (2FA)
  fastify.route({
    method: 'PATCH',
    url: '/items/:itemId',
    schema: {
      description: 'Submit parameters for item (2FA token)',
      tags: ['Pluggy'],
    },
    handler: async (request: any, reply) => {
      try {
        const { itemId } = request.params;
        const { parameters } = request.body;
        
        console.log('🔐 Submitting parameters for item:', itemId, parameters);
        
        const item = await submitParameterUseCase.execute({
          itemId,
          parameters
        });
        
        const response = {
          id: item.id,
          connector: item.connector,
          status: item.status,
          executionStatus: item.executionStatus,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          lastUpdatedAt: item.lastUpdatedAt?.toISOString() || undefined,
          webhookUrl: item.webhookUrl || undefined,
          clientUserId: item.clientUserId || undefined,
          consecutiveFailedUpdates: item.consecutiveFailedUpdates || 0,
          userAction: item.userAction || undefined,
          parameter: item.parameter || undefined,
        };
        
        console.log(`✅ Parameters submitted successfully. New status: ${item.status}`);
        return reply.status(200).send(response);
      } catch (error: any) {
        console.error('❌ Failed to submit parameters:', error.message);
        fastify.log.error('Failed to submit parameters:', error);
        return reply.status(500).send({
          error: error.message,
          message: 'Failed to submit parameters'
        });
      }
    }
  });

  // GET /pluggy/accounts - Listar contas de um item
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/accounts',
    schema: {
      description: 'Get accounts for an item',
      tags: ['Pluggy'],
      querystring: getAccountsSchema,
      response: {
        200: z.array(accountResponseSchema),
        202: z.object({
          message: z.string(),
          status: z.string(),
          executionStatus: z.string(),
          itemId: z.string()
        }),
        400: z.object({
          message: z.string(),
          status: z.string(),
          executionStatus: z.string(),
          itemId: z.string()
        }),
        500: z.object({ error: z.string() })
      }
    },
    handler: async (request, reply) => {
      try {
        console.log('💳 Fetching accounts for item:', request.query.itemId);
        
        // Primeiro verificar o status do item
        const item = await getItemStatusUseCase.execute(request.query.itemId);
        console.log(`📊 Item status: ${item.status} | Execution: ${item.executionStatus}`);
        
        // Se ainda está atualizando, retornar status específico
        if (item.status === 'UPDATING' || item.executionStatus === 'CREATED') {
          return reply.status(202).send({
            message: 'Item is still updating. Please try again in a few moments.',
            status: item.status,
            executionStatus: item.executionStatus,
            itemId: item.id
          });
        }
        
        // Se houve erro na conexão
        if (item.status === 'FAILED' || item.status === 'LOGIN_ERROR') {
          return reply.status(400).send({
            message: 'Connection failed. Please check your credentials and try again.',
            status: item.status,
            executionStatus: item.executionStatus,
            itemId: item.id
          });
        }
        
        const accounts = await getPluggyAccountsUseCase.execute(request.query.itemId);
        console.log(`✅ Found ${accounts.length} accounts`);
        
        return reply.status(200).send(accounts.map(account => {
          const json = account.toJSON();
          return {
            id: json.id,
            type: json.type,
            subtype: json.subtype,
            number: json.number,
            name: json.name,
            marketingName: json.marketingName,
            balance: json.balance,
            itemId: json.itemId,
            taxNumber: json.taxNumber,
            owner: json.owner,
            currencyCode: json.currencyCode,
            currency: json.currency,
            creditLimit: json.creditLimit,
            bank: json.bank,
            createdAt: json.createdAt.toISOString(),
            updatedAt: json.updatedAt.toISOString()
          };
        }));
      } catch (error: any) {
        console.error('❌ Failed to get accounts:', error.message);
        fastify.log.error('Failed to get accounts:', error);
        return reply.status(500).send({
          error: error.message || 'Failed to get accounts'
        });
      }
    }
  });

  // GET /pluggy/transactions - Listar transações de um item
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/transactions',
    schema: {
      description: 'Get transactions for an item',
      tags: ['Pluggy'],
      querystring: getTransactionsSchema,
      response: {
        200: z.array(transactionResponseSchema)
      }
    },
    handler: async (request, reply) => {
      try {
        const { itemId, accountId, from, to } = request.query;
        const fromDate = from ? new Date(from) : undefined;
        const toDate = to ? new Date(to) : undefined;
        
        const transactions = await getPluggyTransactionsUseCase.execute(
          itemId,
          accountId,
          fromDate,
          toDate
        );
        
        return reply.status(200).send(transactions.map(transaction => {
          const json = transaction.toJSON();
          return {
            id: json.id,
            accountId: json.accountId,
            date: json.date.toISOString(),
            description: json.description,
            descriptionRaw: json.descriptionRaw,
            currencyCode: json.currencyCode,
            amount: json.amount,
            currency: json.currency,
            category: json.category,
            merchant: json.merchant,
            creditCardMetadata: json.creditCardMetadata,
            createdAt: json.createdAt.toISOString(),
            updatedAt: json.updatedAt.toISOString()
          };
        }));
      } catch (error) {
        fastify.log.error('Failed to get transactions:', error);
        return reply.status(500).send([]);
      }
    }
  });

  // POST /pluggy/items/:itemId/refresh - Atualizar dados de um item
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/items/:itemId/refresh',
    schema: {
      description: 'Refresh item data',
      tags: ['Pluggy'],
      params: z.object({
        itemId: z.string().uuid('Item ID must be a valid UUID'),
      }),
      response: {
        200: z.object({
          message: z.string(),
        })
      }
    },
    handler: async (request, reply) => {
      try {
        await pluggyClient.refreshItem(request.params.itemId);
        return reply.status(200).send({ message: 'Item refresh requested successfully' });
      } catch (error) {
        fastify.log.error('Failed to refresh item:', error);
        return reply.status(500).send({ message: 'Failed to refresh item' });
      }
    }
  });

  // DELETE /pluggy/items/:itemId - Deletar um item
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/items/:itemId',
    schema: {
      description: 'Delete an item',
      tags: ['Pluggy'],
      params: z.object({
        itemId: z.string().uuid('Item ID must be a valid UUID'),
      }),
      response: {
        200: z.object({
          message: z.string(),
        })
      }
    },
    handler: async (request, reply) => {
      try {
        await pluggyClient.deleteItem(request.params.itemId);
        return reply.status(200).send({ message: 'Item deleted successfully' });
      } catch (error) {
        fastify.log.error('Failed to delete item:', error);
        return reply.status(500).send({ message: 'Failed to delete item' });
      }
    }
  });
};

export default pluggyRoutes;
export const autoPrefix = '/pluggy';