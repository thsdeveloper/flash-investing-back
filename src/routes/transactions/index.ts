import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { 
  createTransactionSchema, 
  updateTransactionSchema, 
  transactionParamsSchema, 
  transactionQuerySchema,
  transactionResponseSchema,
  transactionListResponseSchema,
  budgetResponseSchema,
  budgetQuerySchema
} from '../../schemas/transaction';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction';
import { UpdateTransactionUseCase } from '../../application/use-cases/update-transaction';
import { DeleteTransactionUseCase } from '../../application/use-cases/delete-transaction';
import { GetUserBudgetUseCase } from '../../application/use-cases/get-user-budget';
import { PrismaTransactionRepository } from '../../infrastructure/database/repositories/prisma-transaction-repository';
import { PrismaFinancialAccountRepository } from '../../infrastructure/database/repositories/prisma-financial-account-repository';
import { PrismaFinancialCategoryRepository } from '../../infrastructure/database/repositories/prisma-financial-category-repository';
import { PrismaUserFinanceSettingsRepository } from '../../infrastructure/database/repositories/prisma-user-finance-settings-repository';
import { authMiddleware } from '../../infrastructure/http/middlewares/auth-middleware';
import { FinanceValidationMiddleware } from '../../infrastructure/http/middlewares/finance-validation-middleware';
import { prisma } from '../../infrastructure/database/prisma-client';
import { AuthenticatedRequest } from '../../shared/types/authenticated-request';

const transactionRoutes: FastifyPluginAsync = async function (fastify) {
  // Middleware de autenticação aplicado via preHandler em cada rota

  // Middleware de validação de finanças
  const financeValidation = new FinanceValidationMiddleware(prisma);

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
        400: z.object({
          error: z.string()
        })
      }
    },
    preHandler: [
      authMiddleware,
      financeValidation.validateAccountRequired,
      financeValidation.validateTransactionCreation
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
        500: z.object({ error: z.string() })
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
        404: z.object({
          error: z.string()
        })
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
        400: z.object({
          error: z.string()
        })
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
        400: z.object({
          error: z.string()
        })
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
        500: z.object({ error: z.string() })
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