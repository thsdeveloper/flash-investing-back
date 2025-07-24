import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware } from '../../infrastructure/http/middlewares/auth-middleware';
import { AuthenticatedRequest } from '../../shared/types/authenticated-request';
import { 
  createCreditCardSchema, 
  updateCreditCardSchema, 
  cardIdParamsSchema 
} from '../../schemas/credit-card';
import { CreateCreditCardUseCase } from '../../application/use-cases/create-credit-card';
import { GetCreditCardsUseCase } from '../../application/use-cases/get-credit-cards';
import { GetCreditCardByIdUseCase } from '../../application/use-cases/get-credit-card-by-id';
import { UpdateCreditCardUseCase } from '../../application/use-cases/update-credit-card';
import { DeleteCreditCardUseCase } from '../../application/use-cases/delete-credit-card';
import { PrismaCreditCardRepository } from '../../infrastructure/database/repositories/prisma-credit-card-repository';
import { PrismaFinancialAccountRepository } from '../../infrastructure/database/repositories/prisma-financial-account-repository';
import { prisma } from '../../infrastructure/database/prisma-client';

const creditCardRoutes: FastifyPluginAsync = async function (fastify) {
  const creditCardRepository = new PrismaCreditCardRepository(prisma);
  const financialAccountRepository = new PrismaFinancialAccountRepository(prisma);
  const createCreditCardUseCase = new CreateCreditCardUseCase(creditCardRepository, financialAccountRepository);
  const getCreditCardsUseCase = new GetCreditCardsUseCase(creditCardRepository);
  const getCreditCardByIdUseCase = new GetCreditCardByIdUseCase(creditCardRepository);
  const updateCreditCardUseCase = new UpdateCreditCardUseCase(creditCardRepository, financialAccountRepository);
  const deleteCreditCardUseCase = new DeleteCreditCardUseCase(creditCardRepository);

  // JSON Schema para resposta de cartão de crédito
  const creditCardResponseJsonSchema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      nome: { type: 'string' },
      bandeira: { type: 'string' },
      ultimosDigitos: { type: 'string' },
      limiteTotal: { type: 'number' },
      limiteDisponivel: { type: 'number' },
      diaVencimento: { type: 'number' },
      diaFechamento: { type: 'number' },
      banco: { type: 'string' },
      cor: { type: 'string' },
      ativo: { type: 'boolean' },
      observacoes: { type: 'string' },
      percentualUso: { type: 'number' },
      valorUtilizado: { type: 'number' },
      melhorDiaCompra: { type: 'number' },
      prazoMaximoPagamento: { type: 'number' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' }
    }
  };

  // JSON Schema para resumo de uso
  const creditCardUsageJsonSchema = {
    type: 'object',
    properties: {
      totalCards: { type: 'number' },
      totalLimit: { type: 'number' },
      totalUsed: { type: 'number' },
      totalAvailable: { type: 'number' },
      averageUsagePercentage: { type: 'number' },
      cardsNearLimit: { type: 'number' },
      inactiveCards: { type: 'number' }
    }
  };

  // Criar cartão de crédito
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Criar um novo cartão de crédito',
      tags: ['Credit Cards'],
      security: [{ bearerAuth: [] }],
      body: createCreditCardSchema,
      // response schema omitido para evitar conflitos com fastify-type-provider-zod
    },
    handler: async (request, reply) => {
      try {
        const req = request as AuthenticatedRequest;
        const result = await createCreditCardUseCase.execute(
          req.user.id,
          request.body as any
        );
        return reply.status(201).send(result);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  });

  // Listar cartões de crédito
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Listar todos os cartões de crédito do usuário',
      tags: ['Credit Cards'],
      security: [{ bearerAuth: [] }],
      // response schema omitido para evitar conflitos com fastify-type-provider-zod
    },
    handler: async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const result = await getCreditCardsUseCase.execute(req.user.id);
      return reply.send(result);
    }
  });

  // Listar apenas cartões ativos
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/active',
    preHandler: authMiddleware,
    schema: {
      description: 'Listar apenas cartões de crédito ativos',
      tags: ['Credit Cards'],
      security: [{ bearerAuth: [] }],
      // response schema omitido para evitar conflitos com fastify-type-provider-zod
    },
    handler: async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const result = await getCreditCardsUseCase.getActiveCards(req.user.id);
      return reply.send(result);
    }
  });

  // Resumo de uso dos cartões
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/usage-summary',
    preHandler: authMiddleware,
    schema: {
      description: 'Obter resumo de uso dos cartões de crédito',
      tags: ['Credit Cards'],
      security: [{ bearerAuth: [] }],
      // response schema omitido para evitar conflitos com fastify-type-provider-zod
    },
    handler: async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const result = await getCreditCardsUseCase.getUsageSummary(req.user.id);
      return reply.send(result);
    }
  });

  // Buscar cartão por ID
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Buscar cartão de crédito por ID',
      tags: ['Credit Cards'],
      security: [{ bearerAuth: [] }],
      params: cardIdParamsSchema,
      // response schema omitido para evitar conflitos com fastify-type-provider-zod
    },
    handler: async (request, reply) => {
      try {
        const req = request as AuthenticatedRequest;
        const result = await getCreditCardByIdUseCase.execute(
          req.user.id,
          (request.params as any).id
        );
        return reply.send(result);
      } catch (error: any) {
        return reply.status(404).send({ error: error.message });
      }
    }
  });

  // Atualizar cartão de crédito
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Atualizar cartão de crédito',
      tags: ['Credit Cards'],
      security: [{ bearerAuth: [] }],
      params: cardIdParamsSchema,
      body: updateCreditCardSchema,
      // response schema omitido para evitar conflitos com fastify-type-provider-zod
    },
    handler: async (request, reply) => {
      try {
        const req = request as AuthenticatedRequest;
        const result = await updateCreditCardUseCase.execute(
          req.user.id,
          (request.params as any).id,
          request.body as any
        );
        return reply.send(result);
      } catch (error: any) {
        const statusCode = error.message.includes('não encontrado') ? 404 : 400;
        return reply.status(statusCode).send({ error: error.message });
      }
    }
  });

  // Deletar cartão de crédito
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Deletar cartão de crédito',
      tags: ['Credit Cards'],
      security: [{ bearerAuth: [] }],
      params: cardIdParamsSchema,
      // response schema omitido para evitar conflitos com fastify-type-provider-zod
    },
    handler: async (request, reply) => {
      try {
        const req = request as AuthenticatedRequest;
        await deleteCreditCardUseCase.execute(
          req.user.id,
          (request.params as any).id
        );
        return reply.status(204).send();
      } catch (error: any) {
        return reply.status(404).send({ error: error.message });
      }
    }
  });
};

export default creditCardRoutes;
export const autoPrefix = '/credit-cards';