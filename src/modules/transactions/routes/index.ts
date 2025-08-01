import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { PrismaFinancialAccountRepository } from '@src/modules/financial-accounts/infrastructure/repositories/prisma-financial-account-repository';
import { PrismaFinancialCategoryRepository } from '@src/modules/financial-categories/infrastructure/repositories/prisma-financial-category-repository';
import { PrismaUserFinanceSettingsRepository } from '@src/modules/user-finance-settings/infrastructure/repositories/prisma-user-finance-settings-repository';
import { authMiddleware } from '@src/modules/shared/infrastructure/middlewares/auth-middleware';
import { prisma } from '@src/infrastructure/database/prisma-client';
import {
  PrismaTransactionRepository
} from "@src/modules/transactions/infrastructure/repositories/prisma-transaction-repository";
import {CreateTransactionUseCase} from "@src/modules/transactions/application/use-cases/create-transaction";
import {UpdateTransactionUseCase} from "@src/modules/transactions/application/use-cases/update-transaction";
import {PatchTransactionUseCase} from "@src/modules/transactions/application/use-cases/patch-transaction";
import {DeleteTransactionUseCase} from "@src/modules/transactions/application/use-cases/delete-transaction";
import {GetUserBudgetUseCase} from "@src/modules/user-finance-settings/application/use-cases/get-user-budget";
import {CompleteTransactionUseCase} from "@src/modules/transactions/application/use-cases/complete-transaction";
import {
  budgetQuerySchema, budgetResponseSchema,
  createTransactionSchema, patchTransactionSchema, transactionListResponseSchema, transactionParamsSchema,
  transactionQuerySchema,
  transactionResponseSchema, updateTransactionSchema
} from "@src/modules/transactions/schemas/transaction";
import {errorResponseSchema} from "@src/modules/shared/schemas/common";

const transactionRoutes: FastifyPluginAsync = async function (fastify) {
  // Repositórios
  const transactionRepository = new PrismaTransactionRepository(prisma);
  const financialAccountRepository = new PrismaFinancialAccountRepository(prisma);
  const financialCategoryRepository = new PrismaFinancialCategoryRepository(prisma);
  const userFinanceSettingsRepository = new PrismaUserFinanceSettingsRepository(prisma);

  // Use Cases
  const createTransactionUseCase = new CreateTransactionUseCase(
    transactionRepository,
    financialAccountRepository,
    financialCategoryRepository,
    userFinanceSettingsRepository,
    prisma
  );
  
  const updateTransactionUseCase = new UpdateTransactionUseCase(
    transactionRepository,
    financialAccountRepository,
    financialCategoryRepository,
    userFinanceSettingsRepository,
    prisma
  );

  const patchTransactionUseCase = new PatchTransactionUseCase(
    transactionRepository,
    financialAccountRepository,
    financialCategoryRepository,
    userFinanceSettingsRepository,
    prisma
  );

  const deleteTransactionUseCase = new DeleteTransactionUseCase(
    transactionRepository,
    financialAccountRepository,
    prisma
  );

  const getUserBudgetUseCase = new GetUserBudgetUseCase(
    transactionRepository,
    financialCategoryRepository,
    userFinanceSettingsRepository
  );

  const completeTransactionUseCase = new CompleteTransactionUseCase(
    transactionRepository,
    financialAccountRepository,
    prisma
  );

  // Criar transação
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      description: 'Criar uma nova transação',
      tags: ['Transactions'],
      body: createTransactionSchema,
      response: {
        201: transactionResponseSchema,
        400: errorResponseSchema
      }
    },
    preHandler: [
      authMiddleware
    ],
    handler: async (request, reply) => {
      try {
        const requestBody = { ...request.body }
        
        // Se categoria for um UUID, mapear para categoriaId
        if (requestBody.categoria && 
            typeof requestBody.categoria === 'string' &&
            requestBody.categoria.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          requestBody.categoriaId = requestBody.categoria
          requestBody.categoria = undefined // Limpar o campo categoria para evitar confusão
        }
        
        const transaction = await createTransactionUseCase.execute({
          ...requestBody,
          userId: (request as any).user.id
        });

        return reply.status(201).send(transaction);
      } catch (error) {
        return reply.status(400).send({ 
          error: error instanceof Error ? error.message : 'Erro ao criar transação' 
        });
      }
    }
  });

  // Listar transações do usuário
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      description: 'Listar transações do usuário',
      tags: ['Transactions'],
      querystring: transactionQuerySchema,
      response: {
        200: transactionListResponseSchema,
        500: errorResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const { contaFinanceiraId, categoria, tipo, startDate, endDate, limit, offset } = request.query as any;

        let transactions;
        if (contaFinanceiraId) {
          transactions = await transactionRepository.findByUserIdAndAccountId((request as any).user.id, contaFinanceiraId);
        } else if (categoria) {
          transactions = await transactionRepository.findByUserIdAndCategory((request as any).user.id, categoria);
        } else if (startDate && endDate) {
          transactions = await transactionRepository.findByUserIdAndDateRange((request as any).user.id, startDate, endDate);
        } else {
          transactions = await transactionRepository.findByUserId((request as any).user.id);
        }

        // Filtrar por tipo se especificado
        if (tipo) {
          transactions = transactions.filter(t => t.getTipo() === tipo);
        }

        // Aplicar paginação
        const total = transactions.length;
        const paginatedTransactions = transactions.slice(offset || 0, (offset || 0) + (limit || 20));

        // Calcular resumo
        const receitas = transactions.filter(t => t.isReceita()).reduce((sum, t) => sum + t.getValor(), 0);
        const despesas = transactions.filter(t => t.isDespesa()).reduce((sum, t) => sum + t.getValor(), 0);
        const saldo = receitas - despesas;

        const response = {
          transactions: paginatedTransactions.map(t => ({
            id: t.getId()!,
            descricao: t.getDescricao(),
            valor: t.getValor(),
            tipo: t.getTipo(),
            categoria: t.getCategoria(),
            subcategoria: t.getSubcategoria(),
            data: t.getData().toISOString(),
            status: t.getStatus(),
            observacoes: t.getObservacoes(),
            contaFinanceiraId: t.getContaFinanceiraId(),
            userId: t.getUserId(),
            createdAt: t.getCreatedAt().toISOString(),
            updatedAt: t.getUpdatedAt().toISOString()
          })),
          total,
          totalValue: receitas + despesas,
          summary: {
            receitas,
            despesas,
            saldo
          }
        };

        return reply.send(response);
      } catch (error) {
        return reply.status(500).send({ 
          error: error instanceof Error ? error.message : 'Erro ao buscar transações' 
        });
      }
    }
  });

  // Buscar transação por ID
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    schema: {
      description: 'Buscar transação por ID',
      tags: ['Transactions'],
      params: transactionParamsSchema,
      response: {
        200: transactionResponseSchema,
        404: errorResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const { id } = (request.params as any);
        const transaction = await transactionRepository.findById(id);

        if (!transaction || !transaction.belongsToUser((request as any).user.id)) {
          return reply.status(404).send({ error: 'Transação não encontrada' });
        }

        const response = {
          id: transaction.getId()!,
          descricao: transaction.getDescricao(),
          valor: transaction.getValor(),
          tipo: transaction.getTipo(),
          categoria: transaction.getCategoria(),
          subcategoria: transaction.getSubcategoria(),
          data: transaction.getData().toISOString(),
          status: transaction.getStatus(),
          observacoes: transaction.getObservacoes(),
          contaFinanceiraId: transaction.getContaFinanceiraId(),
          userId: transaction.getUserId(),
          createdAt: transaction.getCreatedAt().toISOString(),
          updatedAt: transaction.getUpdatedAt().toISOString()
        };

        return reply.send(response);
      } catch (error) {
        return reply.status(500).send({ 
          error: error instanceof Error ? error.message : 'Erro ao buscar transação' 
        });
      }
    }
  });

  // Atualizar transação
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/:id',
    schema: {
      description: 'Atualizar uma transação',
      tags: ['Transactions'],
      params: transactionParamsSchema,
      body: updateTransactionSchema,
      response: {
        200: transactionResponseSchema,
        400: errorResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const { id } = (request.params as any);
        const transaction = await updateTransactionUseCase.execute({
          id,
          ...request.body,
          userId: (request as any).user.id
        });

        return reply.send(transaction);
      } catch (error) {
        return reply.status(400).send({ 
          error: error instanceof Error ? error.message : 'Erro ao atualizar transação' 
        });
      }
    }
  });

  // Atualizar parcialmente transação (PATCH)
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/:id',
    schema: {
      description: 'Atualizar parcialmente uma transação com lógica inteligente de saldo',
      tags: ['Transactions'],
      params: transactionParamsSchema,
      body: patchTransactionSchema,
      response: {
        200: transactionResponseSchema,
        400: errorResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const { id } = (request.params as any);
        const requestBody = { ...request.body };
        
        // Validar que pelo menos um campo foi fornecido
        if (Object.keys(requestBody).length === 0) {
          return reply.status(400).send({
            error: 'Pelo menos um campo deve ser fornecido para atualização'
          });
        }
        
        // Se categoria for um UUID, mapear para categoriaId
        if (requestBody.categoria && 
            typeof requestBody.categoria === 'string' &&
            requestBody.categoria.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          requestBody.categoriaId = requestBody.categoria;
          requestBody.categoria = undefined;
        }
        
        const transaction = await patchTransactionUseCase.execute({
          id,
          ...requestBody,
          userId: (request as any).user.id
        });

        return reply.send(transaction);
      } catch (error) {
        return reply.status(400).send({ 
          error: error instanceof Error ? error.message : 'Erro ao atualizar transação' 
        });
      }
    }
  });

  // Deletar transação
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      description: 'Deletar uma transação',
      tags: ['Transactions'],
      params: transactionParamsSchema,
      response: {
        204: z.null(),
        400: errorResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const { id } = (request.params as any);
        await deleteTransactionUseCase.execute({
          id,
          userId: (request as any).user.id
        });

        return reply.status(204).send();
      } catch (error) {
        return reply.status(400).send({ 
          error: error instanceof Error ? error.message : 'Erro ao deletar transação' 
        });
      }
    }
  });

  // Marcar transação como efetuada (completed)
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/:id/complete',
    schema: {
      description: 'Marcar transação como efetuada (completed)',
      tags: ['Transactions'],
      params: transactionParamsSchema,
      response: {
        200: transactionResponseSchema,
        400: errorResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const { id } = (request.params as any);
        const transaction = await completeTransactionUseCase.execute({
          id,
          userId: (request as any).user.id
        });

        return reply.send(transaction);
      } catch (error) {
        return reply.status(400).send({ 
          error: error instanceof Error ? error.message : 'Erro ao marcar transação como efetuada' 
        });
      }
    }
  });

  // Obter orçamento do usuário
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/budget',
    schema: {
      description: 'Obter orçamento atual do usuário',
      tags: ['Transactions'],
      querystring: budgetQuerySchema,
      response: {
        200: budgetResponseSchema,
        500: errorResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const { startDate, endDate } = (request.query as any);
        
        const budget = await getUserBudgetUseCase.execute({
          userId: (request as any).user.id,
          startDate,
          endDate
        });

        return reply.send(budget);
      } catch (error) {
        return reply.status(500).send({ 
          error: error instanceof Error ? error.message : 'Erro ao buscar orçamento' 
        });
      }
    }
  });
};

export default transactionRoutes;
export const autoPrefix = '/transactions';