import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { CreateFinancialAccountUseCase } from '../../application/use-cases/create-financial-account';
import { GetFinancialAccountsUseCase } from '../../application/use-cases/get-financial-accounts';
import { GetFinancialAccountByIdUseCase } from '../../application/use-cases/get-financial-account-by-id';
import { UpdateFinancialAccountUseCase } from '../../application/use-cases/update-financial-account';
import { DeleteFinancialAccountUseCase } from '../../application/use-cases/delete-financial-account';
import { PrismaFinancialAccountRepository } from '../../infrastructure/database/repositories/prisma-financial-account-repository';
import { DomainError } from '../../domain/errors/domain-error';
import { authMiddleware } from '../../infrastructure/http/middlewares/auth-middleware';
import { AuthenticatedRequest } from '../../infrastructure/http/middlewares/auth-middleware';
import { prisma } from '../../infrastructure/database/prisma-client';

const financialAccountRoutes: FastifyPluginAsync = async function (fastify) {
  const financialAccountRepository = new PrismaFinancialAccountRepository(prisma);

  // GET /financial_accounts - Listar contas financeiras
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      description: 'Listar contas financeiras do usuário',
      tags: ['Financial Accounts'],
      response: {
        200: z.object({
          data: z.array(z.object({
            id: z.string().uuid().describe('ID único da conta financeira'),
            nome: z.string().describe('Nome da conta financeira'),
            tipo: z.enum(['conta_corrente', 'conta_poupanca', 'carteira', 'investimento', 'outras']).describe('Tipo da conta financeira'),
            instituicao: z.string().nullable().describe('Instituição financeira'),
            saldo_inicial: z.number().describe('Saldo inicial da conta'),
            saldo_atual: z.number().describe('Saldo atual da conta'),
            cor: z.string().nullable().describe('Cor da conta em hexadecimal'),
            icone: z.string().nullable().describe('Ícone da conta'),
            ativa: z.boolean().describe('Se a conta está ativa'),
            observacoes: z.string().nullable().describe('Observações sobre a conta'),
            user: z.string().uuid().describe('ID do usuário proprietário'),
            date_created: z.string().datetime().describe('Data de criação'),
            date_updated: z.string().datetime().describe('Data de atualização')
          })),
          meta: z.object({
            total_count: z.number().describe('Total de registros'),
            filter_count: z.number().describe('Registros após filtros')
          })
        }).describe('Lista de contas financeiras'),
        401: z.object({
          error: z.string().describe('Mensagem de erro'),
        }).describe('Não autorizado'),
      }
    },
    preHandler: authMiddleware,
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const getAccountsUseCase = new GetFinancialAccountsUseCase(financialAccountRepository);
        const result = await getAccountsUseCase.execute({
          userId: request.user!.id,
          // Sem filtros - retorna todas as contas do usuário
        });
        
        return result;
      } catch (error) {
        if (error instanceof DomainError) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    },
  });

  // GET /financial_accounts/:id - Buscar conta financeira por ID
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    schema: {
      description: 'Buscar conta financeira por ID',
      tags: ['Financial Accounts'],
      params: z.object({
        id: z.string().uuid().describe('ID da conta financeira'),
      }),
      response: {
        200: z.object({
          id: z.string().uuid().describe('ID único da conta financeira'),
          nome: z.string().describe('Nome da conta financeira'),
          tipo: z.enum(['conta_corrente', 'conta_poupanca', 'carteira', 'investimento', 'outras']).describe('Tipo da conta financeira'),
          instituicao: z.string().nullable().optional().describe('Instituição financeira'),
          saldo_inicial: z.number().describe('Saldo inicial da conta'),
          saldo_atual: z.number().describe('Saldo atual da conta'),
          cor: z.string().nullable().optional().describe('Cor da conta em hexadecimal'),
          icone: z.string().nullable().optional().describe('Ícone da conta'),
          ativa: z.boolean().describe('Se a conta está ativa'),
          observacoes: z.string().nullable().optional().describe('Observações sobre a conta'),
          user: z.string().uuid().describe('ID do usuário proprietário'),
          date_created: z.string().datetime().describe('Data de criação'),
          date_updated: z.string().datetime().describe('Data de atualização'),
        }).describe('Conta financeira encontrada'),
        404: z.object({
          error: z.string().describe('Mensagem de erro'),
        }).describe('Conta não encontrada'),
        401: z.object({
          error: z.string().describe('Mensagem de erro'),
        }).describe('Não autorizado'),
      },
    },
    preHandler: authMiddleware,
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const getAccountUseCase = new GetFinancialAccountByIdUseCase(financialAccountRepository);
        const result = await getAccountUseCase.execute((request.params as any).id, request.user!.id);
        
        return result;
      } catch (error) {
        if (error instanceof DomainError) {
          const statusCode = error.code === 'FINANCIAL_ACCOUNT_NOT_FOUND' ? 404 : 400;
          return reply.status(statusCode).send({ error: error.message });
        }
        throw error;
      }
    },
  });

  // POST /financial_accounts - Criar nova conta financeira
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      description: 'Criar nova conta financeira',
      tags: ['Financial Accounts'],
      body: z.object({
        nome: z.string().min(1).max(255).describe('Nome da conta financeira'),
        tipo: z.enum(['conta_corrente', 'conta_poupanca', 'carteira', 'investimento', 'outras']).describe('Tipo da conta financeira'),
        instituicao: z.string().max(255).optional().describe('Instituição financeira'),
        saldo_inicial: z.number().default(0).describe('Saldo inicial da conta'),
        cor: z.string().max(7).optional().describe('Cor da conta em hexadecimal'),
        icone: z.string().max(50).optional().describe('Ícone da conta'),
        observacoes: z.string().max(1000).optional().describe('Observações sobre a conta'),
      }),
      response: {
        201: z.object({
          id: z.string().uuid().describe('ID único da conta financeira'),
          nome: z.string().describe('Nome da conta financeira'),
          tipo: z.enum(['conta_corrente', 'conta_poupanca', 'carteira', 'investimento', 'outras']).describe('Tipo da conta financeira'),
          instituicao: z.string().nullable().optional().describe('Instituição financeira'),
          saldo_inicial: z.number().describe('Saldo inicial da conta'),
          saldo_atual: z.number().describe('Saldo atual da conta'),
          cor: z.string().nullable().optional().describe('Cor da conta em hexadecimal'),
          icone: z.string().nullable().optional().describe('Ícone da conta'),
          ativa: z.boolean().describe('Se a conta está ativa'),
          observacoes: z.string().nullable().optional().describe('Observações sobre a conta'),
          user: z.string().uuid().describe('ID do usuário proprietário'),
          date_created: z.string().datetime().describe('Data de criação'),
          date_updated: z.string().datetime().describe('Data de atualização'),
        }).describe('Conta financeira criada com sucesso'),
        400: z.object({
          error: z.string().describe('Mensagem de erro'),
        }).describe('Erro de validação'),
        401: z.object({
          error: z.string().describe('Mensagem de erro'),
        }).describe('Não autorizado'),
      },
    },
    preHandler: authMiddleware,
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const body = request.body as any;
        const createAccountUseCase = new CreateFinancialAccountUseCase(financialAccountRepository);
        const result = await createAccountUseCase.execute({
          nome: body.nome,
          tipo: body.tipo,
          instituicao: body.instituicao,
          saldoInicial: typeof body.saldo_inicial === 'string' ? parseFloat(body.saldo_inicial) : body.saldo_inicial,
          cor: body.cor,
          icone: body.icone,
          observacoes: body.observacoes,
          userId: request.user!.id,
        });
        
        return reply.status(201).send(result);
      } catch (error) {
        if (error instanceof DomainError) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    },
  });

  // PATCH /financial_accounts/:id - Atualizar conta financeira
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/:id',
    schema: {
      description: 'Atualizar conta financeira',
      tags: ['Financial Accounts'],
      params: z.object({
        id: z.string().uuid().describe('ID da conta financeira'),
      }),
      body: z.object({
        nome: z.string().min(1).max(255).optional().describe('Nome da conta financeira'),
        tipo: z.enum(['conta_corrente', 'conta_poupanca', 'carteira', 'investimento', 'outras']).optional().describe('Tipo da conta financeira'),
        instituicao: z.string().max(255).optional().describe('Instituição financeira'),
        saldo_inicial: z.number().optional().describe('Saldo inicial da conta'),
        saldo_atual: z.number().optional().describe('Saldo atual da conta'),
        cor: z.string().max(7).optional().describe('Cor da conta em hexadecimal'),
        icone: z.string().max(50).optional().describe('Ícone da conta'),
        ativa: z.boolean().optional().describe('Se a conta está ativa'),
        observacoes: z.string().max(1000).optional().describe('Observações sobre a conta'),
      }),
      response: {
        200: z.object({
          id: z.string().uuid().describe('ID único da conta financeira'),
          nome: z.string().describe('Nome da conta financeira'),
          tipo: z.enum(['conta_corrente', 'conta_poupanca', 'carteira', 'investimento', 'outras']).describe('Tipo da conta financeira'),
          instituicao: z.string().nullable().optional().describe('Instituição financeira'),
          saldo_inicial: z.number().describe('Saldo inicial da conta'),
          saldo_atual: z.number().describe('Saldo atual da conta'),
          cor: z.string().nullable().optional().describe('Cor da conta em hexadecimal'),
          icone: z.string().nullable().optional().describe('Ícone da conta'),
          ativa: z.boolean().describe('Se a conta está ativa'),
          observacoes: z.string().nullable().optional().describe('Observações sobre a conta'),
          user: z.string().uuid().describe('ID do usuário proprietário'),
          date_created: z.string().datetime().describe('Data de criação'),
          date_updated: z.string().datetime().describe('Data de atualização'),
        }).describe('Conta financeira atualizada com sucesso'),
        404: z.object({
          error: z.string().describe('Mensagem de erro'),
        }).describe('Conta não encontrada'),
        400: z.object({
          error: z.string().describe('Mensagem de erro'),
        }).describe('Erro de validação'),
        401: z.object({
          error: z.string().describe('Mensagem de erro'),
        }).describe('Não autorizado'),
      },
    },
    preHandler: authMiddleware,
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const body = request.body as any;
        const updateAccountUseCase = new UpdateFinancialAccountUseCase(financialAccountRepository);
        const result = await updateAccountUseCase.execute(
          (request.params as any).id,
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
          request.user!.id
        );
        
        return result;
      } catch (error) {
        if (error instanceof DomainError) {
          const statusCode = error.code === 'FINANCIAL_ACCOUNT_NOT_FOUND' ? 404 : 400;
          return reply.status(statusCode).send({ error: error.message });
        }
        throw error;
      }
    },
  });

  // DELETE /financial_accounts/:id - Deletar conta financeira
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      description: 'Deletar conta financeira (soft delete)',
      tags: ['Financial Accounts'],
      params: z.object({
        id: z.string().uuid().describe('ID da conta financeira'),
      }),
      querystring: z.object({
        hard: z.enum(['true', 'false']).optional().describe('Hard delete (permanente)'),
      }),
      response: {
        204: z.void().describe('Conta financeira deletada com sucesso'),
        404: z.object({
          error: z.string().describe('Mensagem de erro'),
        }).describe('Conta não encontrada'),
        401: z.object({
          error: z.string().describe('Mensagem de erro'),
        }).describe('Não autorizado'),
      },
    },
    preHandler: authMiddleware,
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const query = request.query as any;
        const deleteAccountUseCase = new DeleteFinancialAccountUseCase(financialAccountRepository);
        await deleteAccountUseCase.execute(
          (request.params as any).id,
          request.user!.id,
          query.hard !== 'true' // Se hard=true, softDelete=false
        );
        
        return reply.status(204).send();
      } catch (error) {
        if (error instanceof DomainError) {
          const statusCode = error.code === 'FINANCIAL_ACCOUNT_NOT_FOUND' ? 404 : 400;
          return reply.status(statusCode).send({ error: error.message });
        }
        throw error;
      }
    },
  });
};

export default financialAccountRoutes;
export const autoPrefix = '/financial_accounts';