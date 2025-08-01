import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { DomainError } from '@src/modules/shared/domain/errors/domain-error';
import { authMiddleware } from '@src/modules/shared/infrastructure/middlewares/auth-middleware';
import { AuthenticatedRequest } from '@src/modules/shared/types/authenticated-request';
import { prisma } from '@src/infrastructure/database/prisma-client';
import { 
  standardSuccessResponseSchema,
  standardPaginatedResponseSchema,
  standardError400Schema,
  standardError401Schema,
  standardError404Schema,
  standardError500Schema
} from '@src/modules/shared/schemas/common';
import { ResponseHelper } from '@src/modules/shared/utils/response-helper';
import {
  PrismaFinancialAccountRepository
} from "@src/modules/financial-accounts/infrastructure/repositories/prisma-financial-account-repository";
import {
  GetFinancialAccountsUseCase
} from "@src/modules/financial-accounts/application/use-cases/get-financial-accounts";
import {
  GetFinancialAccountByIdUseCase
} from "@src/modules/financial-accounts/application/use-cases/get-financial-account-by-id";
import {
  CreateFinancialAccountUseCase
} from "@src/modules/financial-accounts/application/use-cases/create-financial-account";
import {
  UpdateFinancialAccountUseCase
} from "@src/modules/financial-accounts/application/use-cases/update-financial-account";
import {
  DeleteFinancialAccountUseCase
} from "@src/modules/financial-accounts/application/use-cases/delete-financial-account";
import {
  financialAccountResponseSchema,
  createFinancialAccountSchema,
  updateFinancialAccountSchema,
  financialAccountQuerySchema
} from "@src/modules/financial-accounts/schemas/financial-account";

const financialAccountRoutes: FastifyPluginAsync = async function (fastify) {
  const financialAccountRepository = new PrismaFinancialAccountRepository(prisma);

  // GET /financial_accounts - Listar contas financeiras
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Listar contas financeiras do usuário',
      tags: ['Financial Accounts'],
      security: [{ bearerAuth: [] }],
      querystring: financialAccountQuerySchema,
      response: {
        200: standardPaginatedResponseSchema(financialAccountResponseSchema),
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const getAccountsUseCase = new GetFinancialAccountsUseCase(financialAccountRepository);
        const result = await getAccountsUseCase.execute({
          userId: (request as AuthenticatedRequest).user.id,
          // Sem filtros - retorna todas as contas do usuário
        });
        
        const response = ResponseHelper.successPaginated(
          result.data,
          1, // current page - implementar paginação futuramente
          1, // total pages
          result.meta.total_count,
          result.meta.filter_count,
          { message: 'Contas financeiras recuperadas com sucesso' }
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
    },
  });

  // GET /financial_accounts/:id - Buscar conta financeira por ID
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Buscar conta financeira por ID',
      tags: ['Financial Accounts'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string().uuid().describe('ID da conta financeira'),
      }),
      response: {
        200: standardSuccessResponseSchema(financialAccountResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const getAccountUseCase = new GetFinancialAccountByIdUseCase(financialAccountRepository);
        const { id } = request.params as { id: string };
        const result = await getAccountUseCase.execute(id, (request as AuthenticatedRequest).user.id);
        
        const response = ResponseHelper.success(
          result,
          { message: 'Conta financeira recuperada com sucesso' }
        );
        
        return reply.status(200).send(response as any);
      } catch (error) {
        if (error instanceof DomainError) {
          if (error.code === 'FINANCIAL_ACCOUNT_NOT_FOUND') {
            const response = ResponseHelper.notFound('Conta financeira');
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
    },
  });

  // POST /financial_accounts - Criar nova conta financeira
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Criar nova conta financeira',
      tags: ['Financial Accounts'],
      security: [{ bearerAuth: [] }],
      body: createFinancialAccountSchema,
      response: {
        201: standardSuccessResponseSchema(financialAccountResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const body = request.body as any;
        const createAccountUseCase = new CreateFinancialAccountUseCase(financialAccountRepository);
        const result = await createAccountUseCase.execute({
          nome: body.nome,
          tipo: body.tipo,
          instituicao: body.instituicao,
          saldoInicial: typeof body.saldo_inicial === 'string' ? parseFloat(body.saldo_inicial) : body.saldo_inicial || 0,
          cor: body.cor,
          icone: body.icone,
          observacoes: body.observacoes,
          userId: (request as AuthenticatedRequest).user.id,
        });
        
        const response = ResponseHelper.success(
          result,
          { message: 'Conta financeira criada com sucesso' }
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
    },
  });

  // PATCH /financial_accounts/:id - Atualizar conta financeira
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Atualizar conta financeira',
      tags: ['Financial Accounts'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string().uuid().describe('ID da conta financeira'),
      }),
      body: updateFinancialAccountSchema,
      response: {
        200: standardSuccessResponseSchema(financialAccountResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const body = request.body as any;
        const { id } = request.params as { id: string };
        const updateAccountUseCase = new UpdateFinancialAccountUseCase(financialAccountRepository);
        const result = await updateAccountUseCase.execute(
          id,
          {
            nome: body.nome,
            tipo: body.tipo,
            instituicao: body.instituicao,
            saldoInicial: body.saldo_inicial ? (typeof body.saldo_inicial === 'string' ? parseFloat(body.saldo_inicial) : body.saldo_inicial) : undefined,
            saldoAtual: body.saldo_atual ? (typeof body.saldo_atual === 'string' ? parseFloat(body.saldo_atual) : body.saldo_atual) : undefined,
            cor: body.cor,
            icone: body.icone,
            ativa: body.ativa,
            observacoes: body.observacoes,
          },
          (request as AuthenticatedRequest).user.id
        );
        
        const response = ResponseHelper.success(
          result,
          { message: 'Conta financeira atualizada com sucesso' }
        );
        
        return reply.status(200).send(response as any);
      } catch (error) {
        if (error instanceof DomainError) {
          if (error.code === 'FINANCIAL_ACCOUNT_NOT_FOUND') {
            const response = ResponseHelper.notFound('Conta financeira');
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
    },
  });

  // DELETE /financial_accounts/:id - Deletar conta financeira
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Deletar conta financeira (soft delete)',
      tags: ['Financial Accounts'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string().uuid().describe('ID da conta financeira'),
      }),
      querystring: z.object({
        hard: z.enum(['true', 'false']).optional().describe('Hard delete (permanente)'),
      }),
      response: {
        200: standardSuccessResponseSchema(z.null()),
        400: standardError400Schema,
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const query = request.query as any;
        const { id } = request.params as { id: string };
        const deleteAccountUseCase = new DeleteFinancialAccountUseCase(financialAccountRepository);
        await deleteAccountUseCase.execute(
          id,
          (request as AuthenticatedRequest).user.id,
          query.hard !== 'true' // Se hard=true, softDelete=false
        );
        
        const response = ResponseHelper.success(
          null,
          { message: 'Conta financeira removida com sucesso' }
        );
        
        return reply.status(200).send(response as any);
      } catch (error) {
        if (error instanceof DomainError) {
          if (error.code === 'FINANCIAL_ACCOUNT_NOT_FOUND') {
            const response = ResponseHelper.notFound('Conta financeira');
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
    },
  });
};

export default financialAccountRoutes;
export const autoPrefix = '/financial_accounts';