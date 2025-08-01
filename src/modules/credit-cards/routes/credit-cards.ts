import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { authMiddleware } from '@src/modules/shared/infrastructure/middlewares/auth-middleware';
import { AuthenticatedRequest } from '@src/modules/shared/types/authenticated-request';
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
  createCreditCardSchema, 
  updateCreditCardSchema, 
  creditCardResponseSchema,
  cardIdParamsSchema
} from '../schemas/credit-card';
import { prisma } from "@src/infrastructure/database/prisma-client";
import { PrismaCreditCardRepository } from "@src/modules/credit-cards/infrastructure/repositories/prisma-credit-card-repository";
import { PrismaFinancialAccountRepository } from "@src/modules/financial-accounts/infrastructure/repositories/prisma-financial-account-repository";
import { CreateCreditCardUseCase } from "@src/modules/credit-cards/application/use-cases/create-credit-card";
import { GetCreditCardsUseCase } from "@src/modules/credit-cards/application/use-cases/get-credit-cards";
import { GetCreditCardByIdUseCase } from "@src/modules/credit-cards/application/use-cases/get-credit-card-by-id";
import { UpdateCreditCardUseCase } from "@src/modules/credit-cards/application/use-cases/update-credit-card";
import { DeleteCreditCardUseCase } from "@src/modules/credit-cards/application/use-cases/delete-credit-card";
import { DomainError } from "@src/modules/shared/domain/errors/domain-error";

const creditCardRoutes: FastifyPluginAsync = async function (fastify) {
  const creditCardRepository = new PrismaCreditCardRepository(prisma);
  const financialAccountRepository = new PrismaFinancialAccountRepository(prisma);

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
      response: {
        201: standardSuccessResponseSchema(creditCardResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const createUseCase = new CreateCreditCardUseCase(creditCardRepository, financialAccountRepository);
        
        const body = request.body as any;
        const userId = (request as AuthenticatedRequest).user.id;
        const result = await createUseCase.execute(userId, body);
        
        const response = ResponseHelper.success(
          result,
          { message: 'Cartão de crédito criado com sucesso' }
        );
        
        return reply.status(201).send(response);
      } catch (error: any) {
        if (error instanceof DomainError) {
          const response = ResponseHelper.error(error.message, ['CREDIT_CARD_CREATION_ERROR']);
          return reply.status(400).send(response);
        }
        const response = ResponseHelper.internalServerError(error);
        return reply.status(500).send(response);
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
      response: {
        200: standardSuccessResponseSchema(z.array(creditCardResponseSchema)),
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const getCreditCardsUseCase = new GetCreditCardsUseCase(creditCardRepository);
        
        const userId = (request as AuthenticatedRequest).user.id;
        const result = await getCreditCardsUseCase.execute(userId);
        
        const response = ResponseHelper.success(
          result,
          { message: 'Cartões de crédito recuperados com sucesso' }
        );
        
        return reply.status(200).send(response);
      } catch (error: any) {
        const response = ResponseHelper.internalServerError(error);
        return reply.status(500).send(response);
      }
    }
  });

  // Buscar cartão de crédito por ID
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Buscar cartão de crédito por ID',
      tags: ['Credit Cards'],
      security: [{ bearerAuth: [] }],
      params: cardIdParamsSchema,
      response: {
        200: standardSuccessResponseSchema(creditCardResponseSchema),
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const getCreditCardByIdUseCase = new GetCreditCardByIdUseCase(creditCardRepository);
        
        const { id } = request.params as any;
        const userId = (request as AuthenticatedRequest).user.id;
        const result = await getCreditCardByIdUseCase.execute(userId, id);
        
        if (!result) {
          const response = ResponseHelper.notFound('Cartão de crédito');
          return reply.status(404).send(response);
        }
        
        const response = ResponseHelper.success(
          result,
          { message: 'Cartão de crédito encontrado com sucesso' }
        );
        
        return reply.status(200).send(response);
      } catch (error: any) {
        if (error instanceof DomainError) {
          const response = ResponseHelper.notFound('Cartão de crédito');
          return reply.status(404).send(response);
        }
        const response = ResponseHelper.internalServerError(error);
        return reply.status(500).send(response);
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
      response: {
        200: standardSuccessResponseSchema(creditCardResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const updateCreditCardUseCase = new UpdateCreditCardUseCase(creditCardRepository, financialAccountRepository);
        
        const { id } = request.params as any;
        const body = request.body as any;
        const userId = (request as AuthenticatedRequest).user.id;
        const result = await updateCreditCardUseCase.execute(userId, id, body);
        
        const response = ResponseHelper.success(
          result,
          { message: 'Cartão de crédito atualizado com sucesso' }
        );
        
        return reply.status(200).send(response);
      } catch (error: any) {
        if (error instanceof DomainError) {
          const response = ResponseHelper.notFound('Cartão de crédito');
          return reply.status(404).send(response);
        }
        const response = ResponseHelper.internalServerError(error);
        return reply.status(500).send(response);
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
        const deleteCreditCardUseCase = new DeleteCreditCardUseCase(creditCardRepository);
        
        const { id } = request.params as any;
        const userId = (request as AuthenticatedRequest).user.id;
        await deleteCreditCardUseCase.execute(userId, id);
        
        const response = ResponseHelper.success(
          null,
          { message: 'Cartão de crédito deletado com sucesso' }
        );
        
        return reply.status(200).send(response);
      } catch (error: any) {
        if (error instanceof DomainError) {
          const response = ResponseHelper.notFound('Cartão de crédito');
          return reply.status(404).send(response);
        }
        const response = ResponseHelper.internalServerError(error);
        return reply.status(500).send(response);
      }
    }
  });
};

export default creditCardRoutes;
// Sem autoPrefix pois será registrado via index.ts