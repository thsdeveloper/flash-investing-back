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
import { 
  standardSuccessResponseSchema,
  standardPaginatedResponseSchema,
  standardError400Schema,
  standardError401Schema,
  standardError404Schema,
  standardError422Schema,
  standardError500Schema
} from '@src/modules/shared/schemas/common';
import { ResponseHelper } from '@src/modules/shared/utils/response-helper';
import { DomainError } from '@src/modules/shared/domain/errors/domain-error';
import { AuthenticatedRequest } from '@src/modules/shared/types/authenticated-request';

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
        201: standardSuccessResponseSchema(transactionResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        500: standardError500Schema
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
          userId: (request as AuthenticatedRequest).user.id
        });

        const response = ResponseHelper.success(
          transaction,
          { message: 'Transação criada com sucesso' }
        );
        
        return reply.status(201).send(response as any);
      } catch (error) {
        if (error instanceof DomainError) {
          const response = ResponseHelper.error(
            error.message,
            [error.code || 'DOMAIN_ERROR']
          );
          return reply.status(400).send(response as any);
        }
        
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any);
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
        200: standardSuccessResponseSchema(z.array(transactionResponseSchema)),
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const { contaFinanceiraId, categoria, tipo, startDate, endDate, limit, offset } = request.query ;

        let transactions;
        if (contaFinanceiraId) {
          transactions = await transactionRepository.findByUserIdAndAccountId((request as AuthenticatedRequest).user.id, contaFinanceiraId);
        } else if (categoria) {
          transactions = await transactionRepository.findByUserIdAndCategory((request as AuthenticatedRequest).user.id, categoria);
        } else if (startDate && endDate) {
          transactions = await transactionRepository.findByUserIdAndDateRange((request as AuthenticatedRequest).user.id, startDate, endDate);
        } else {
          transactions = await transactionRepository.findByUserId((request as AuthenticatedRequest).user.id);
        }

        // Filtrar por tipo se especificado
        if (tipo) {
          transactions = transactions.filter(t => t.getTipo() === tipo);
        }

        // Aplicar paginação
        const total = transactions.length;
        const itemsPerPage = limit || 20;
        const currentPage = Math.floor((offset || 0) / itemsPerPage) + 1;
        const totalPages = Math.ceil(total / itemsPerPage);
        const paginatedTransactions = transactions.slice(offset || 0, (offset || 0) + itemsPerPage);

        // Calcular resumo
        const receitas = transactions.filter(t => t.isReceita()).reduce((sum, t) => sum + t.getValor(), 0);
        const despesas = transactions.filter(t => t.isDespesa()).reduce((sum, t) => sum + t.getValor(), 0);
        const saldo = receitas - despesas;

        const transactionData = {
          items: paginatedTransactions.map(t => ({
            id: t.getId()!,
            descricao: t.getDescricao(),
            valor: t.getValor(),
            tipo: t.getTipo(),
            categoria: t.getCategoria(),
            categoriaId: t.getCategoriaId(),
            subcategoria: t.getSubcategoria(),
            data: t.getData().toISOString(),
            status: t.getStatus(),
            observacoes: t.getObservacoes(),
            contaFinanceiraId: t.getContaFinanceiraId(),
            userId: t.getUserId(),
            createdAt: t.getCreatedAt().toISOString(),
            updatedAt: t.getUpdatedAt().toISOString()
          })),
          summary: {
            receitas,
            despesas,
            saldo,
            totalValue: receitas + despesas
          }
        };

        const response = ResponseHelper.success(
          transactionData.items,
          { message: 'Transações recuperadas com sucesso' }
        );

        return reply.status(200).send(response as any);
      } catch (error) {
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any);
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
        200: standardSuccessResponseSchema(transactionResponseSchema),
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const { id } = (request.params );
        const transaction = await transactionRepository.findById(id);

        if (!transaction || !transaction.belongsToUser((request as AuthenticatedRequest).user.id)) {
          const response = ResponseHelper.notFound('Transação');
          return reply.status(404).send(response as any);
        }

        const transactionData = {
          id: transaction.getId()!,
          descricao: transaction.getDescricao(),
          valor: transaction.getValor(),
          tipo: transaction.getTipo(),
          categoria: transaction.getCategoria(),
          categoriaId: transaction.getCategoriaId(),
          subcategoria: transaction.getSubcategoria(),
          data: transaction.getData().toISOString(),
          status: transaction.getStatus(),
          observacoes: transaction.getObservacoes(),
          contaFinanceiraId: transaction.getContaFinanceiraId(),
          userId: transaction.getUserId(),
          createdAt: transaction.getCreatedAt().toISOString(),
          updatedAt: transaction.getUpdatedAt().toISOString()
        };

        const response = ResponseHelper.success(
          transactionData,
          { message: 'Transação recuperada com sucesso' }
        );

        return reply.status(200).send(response as any);
      } catch (error) {
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any);
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
        200: standardSuccessResponseSchema(transactionResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const { id } = (request.params );
        const transaction = await updateTransactionUseCase.execute({
          id,
          ...request.body,
          userId: (request as AuthenticatedRequest).user.id
        });

        const response = ResponseHelper.success(
          transaction,
          { message: 'Transação atualizada com sucesso' }
        );

        return reply.status(200).send(response as any);
      } catch (error) {
        if (error instanceof DomainError) {
          if (error.code === 'TRANSACTION_NOT_FOUND') {
            const response = ResponseHelper.notFound('Transação');
            return reply.status(404).send(response as any);
          }
          
          const response = ResponseHelper.error(
            error.message,
            [error.code || 'DOMAIN_ERROR']
          );
          return reply.status(400).send(response as any);
        }
        
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any);
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
        200: standardSuccessResponseSchema(transactionResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const { id } = (request.params );
        const requestBody = { ...request.body };
        
        // Validar que pelo menos um campo foi fornecido
        if (Object.keys(requestBody).length === 0) {
          const response = ResponseHelper.error(
            'Pelo menos um campo deve ser fornecido para atualização',
            ['MISSING_FIELDS']
          );
          return reply.status(400).send(response as any);
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
          userId: (request as AuthenticatedRequest).user.id
        });

        const response = ResponseHelper.success(
          transaction,
          { message: 'Transação atualizada parcialmente com sucesso' }
        );
        
        return reply.status(200).send(response as any);
      } catch (error) {
        if (error instanceof DomainError) {
          if (error.code === 'TRANSACTION_NOT_FOUND') {
            const response = ResponseHelper.notFound('Transação');
            return reply.status(404).send(response as any);
          }
          
          const response = ResponseHelper.error(
            error.message,
            [error.code || 'DOMAIN_ERROR']
          );
          return reply.status(400).send(response as any);
        }
        
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any);
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
        200: standardSuccessResponseSchema(z.null()),
        400: standardError400Schema,
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const { id } = (request.params );
        await deleteTransactionUseCase.execute({
          id,
          userId: (request as AuthenticatedRequest).user.id
        });

        const response = ResponseHelper.success(
          null,
          { message: 'Transação deletada com sucesso' }
        );
        
        return reply.status(200).send(response as any);
      } catch (error) {
        if (error instanceof DomainError) {
          if (error.code === 'TRANSACTION_NOT_FOUND') {
            const response = ResponseHelper.notFound('Transação');
            return reply.status(404).send(response as any);
          }
          
          const response = ResponseHelper.error(
            error.message,
            [error.code || 'DOMAIN_ERROR']
          );
          return reply.status(400).send(response as any);
        }
        
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any);
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
        200: standardSuccessResponseSchema(transactionResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const { id } = (request.params );
        const transaction = await completeTransactionUseCase.execute({
          id,
          userId: (request as AuthenticatedRequest).user.id
        });

        const response = ResponseHelper.success(
          transaction,
          { message: 'Transação marcada como efetuada com sucesso' }
        );
        
        return reply.status(200).send(response as any);
      } catch (error) {
        if (error instanceof DomainError) {
          if (error.code === 'TRANSACTION_NOT_FOUND') {
            const response = ResponseHelper.notFound('Transação');
            return reply.status(404).send(response as any);
          }
          
          const response = ResponseHelper.error(
            error.message,
            [error.code || 'DOMAIN_ERROR']
          );
          return reply.status(400).send(response as any);
        }
        
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any);
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
        200: standardSuccessResponseSchema(budgetResponseSchema),
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const { startDate, endDate } = (request.query );
        
        const budget = await getUserBudgetUseCase.execute({
          userId: (request as AuthenticatedRequest).user.id,
          startDate,
          endDate
        });

        const response = ResponseHelper.success(
          budget,
          { message: 'Orçamento recuperado com sucesso' }
        );
        
        return reply.status(200).send(response as any);
      } catch (error) {
        if (error instanceof DomainError) {
          const response = ResponseHelper.error(
            error.message,
            [error.code || 'DOMAIN_ERROR']
          );
          return reply.status(400).send(response as any);
        }
        
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any);
      }
    }
  });
};

export default transactionRoutes;
export const autoPrefix = '/transactions';