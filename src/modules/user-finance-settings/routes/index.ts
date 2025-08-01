import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { DomainError } from '@src/modules/shared/domain/errors/domain-error';
import { authMiddleware } from '@src/modules/shared/infrastructure/middlewares/auth-middleware';
import { AuthenticatedRequest } from '@src/modules/shared/types/authenticated-request';
import { prisma } from '@src/infrastructure/database/prisma-client';
import {
  standardSuccessResponseSchema,
  standardError400Schema,
  standardError401Schema,
  standardError404Schema,
  standardError500Schema
} from '@src/modules/shared/schemas/common';
import { ResponseHelper } from '@src/modules/shared/utils/response-helper';
import { successResponseSchema } from '@src/modules/shared/utils/response-helper';
import {
  CreateUserFinanceSettingsUseCase
} from '@src/modules/user-finance-settings/application/use-cases/create-user-finance-settings';
import {
  GetUserFinanceSettingsUseCase
} from '@src/modules/user-finance-settings/application/use-cases/get-user-finance-settings';
import {
  UpdateUserFinanceSettingsUseCase
} from '@src/modules/user-finance-settings/application/use-cases/update-user-finance-settings';
import {
  DeleteUserFinanceSettingsUseCase
} from '@src/modules/user-finance-settings/application/use-cases/delete-user-finance-settings';
import {
  PrismaUserFinanceSettingsRepository
} from '@src/modules/user-finance-settings/infrastructure/repositories/prisma-user-finance-settings-repository';
import {
  createUserFinanceSettingsBodySchema,
  updateUserFinanceSettingsBodySchema,
  userFinanceSettingsResponseSchema,
  getUserFinanceSettingsResponseSchema,
  userFinanceSettingsParamsSchema
} from '@src/modules/user-finance-settings/schemas/user-finance-settings';

const userFinanceSettingsRoutes: FastifyPluginAsync = async function (fastify) {
  const userFinanceSettingsRepository = new PrismaUserFinanceSettingsRepository(prisma);

  // POST /user-finance-settings - Criar configurações financeiras do usuário
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Criar configurações financeiras do usuário',
      tags: ['User Finance Settings'],
      security: [{ bearerAuth: [] }],
      body: createUserFinanceSettingsBodySchema,
      response: {
        201: successResponseSchema(userFinanceSettingsResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const createUseCase = new CreateUserFinanceSettingsUseCase(userFinanceSettingsRepository);
        
        const result = await createUseCase.execute({
          ...authenticatedRequest.body,
          userId: authenticatedRequest.user.id
        });

        return reply.status(201).send(
          ResponseHelper.success(result, {
            message: 'Configurações financeiras criadas com sucesso'
          })
        );
      } catch (error) {
        if (error instanceof DomainError || (error instanceof Error && error.message === 'User already has finance settings')) {
          return reply.status(400).send(
            ResponseHelper.error(
              error.message === 'User already has finance settings'
                ? 'Usuário já possui configurações financeiras'
                : error.message,
              ['USER_FINANCE_SETTINGS_ALREADY_EXISTS']
            )
          );
        }
        
        fastify.log.error(error);
        return reply.status(500).send(
          ResponseHelper.internalServerError(error as Error)
        );
      }
    }
  });

  // GET /user-finance-settings - Obter configurações financeiras do usuário
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Obter configurações financeiras do usuário',
      tags: ['User Finance Settings'],
      security: [{ bearerAuth: [] }],
      response: {
        200: successResponseSchema(getUserFinanceSettingsResponseSchema),
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const getUseCase = new GetUserFinanceSettingsUseCase(userFinanceSettingsRepository);
        
        const result = await getUseCase.execute(authenticatedRequest.user.id);

        if (!result) {
          return reply.status(404).send(
            ResponseHelper.notFound('Configurações financeiras')
          );
        }

        return reply.status(200).send(
          ResponseHelper.success(result, {
            message: 'Configurações financeiras obtidas com sucesso'
          })
        );
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send(
          ResponseHelper.internalServerError(error as Error)
        );
      }
    }
  });

  // PUT /user-finance-settings/:id - Atualizar configurações financeiras
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Atualizar configurações financeiras do usuário',
      tags: ['User Finance Settings'],
      security: [{ bearerAuth: [] }],
      params: userFinanceSettingsParamsSchema,
      body: updateUserFinanceSettingsBodySchema,
      response: {
        200: successResponseSchema(userFinanceSettingsResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const updateUseCase = new UpdateUserFinanceSettingsUseCase(userFinanceSettingsRepository);
        
        const result = await updateUseCase.execute(
          (authenticatedRequest.params as { id: string }).id,
          authenticatedRequest.user.id,
          authenticatedRequest.body
        );

        return reply.status(200).send(
          ResponseHelper.success(result, {
            message: 'Configurações financeiras atualizadas com sucesso'
          })
        );
      } catch (error) {
        if (error instanceof DomainError) {
          return reply.status(400).send(
            ResponseHelper.error(error.message, [error.code])
          );
        }

        if (error instanceof Error) {
          if (error.message === 'Finance settings not found') {
            return reply.status(404).send(
              ResponseHelper.notFound('Configurações financeiras')
            );
          }
          
          if (error.message === 'Unauthorized') {
            return reply.status(401).send(
              ResponseHelper.unauthorized()
            );
          }
        }
        
        fastify.log.error(error);
        return reply.status(500).send(
          ResponseHelper.internalServerError(error as Error)
        );
      }
    }
  });

  // DELETE /user-finance-settings/:id - Deletar configurações financeiras
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Deletar configurações financeiras do usuário',
      tags: ['User Finance Settings'],
      security: [{ bearerAuth: [] }],
      params: userFinanceSettingsParamsSchema,
      response: {
        204: z.object({}),
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const deleteUseCase = new DeleteUserFinanceSettingsUseCase(userFinanceSettingsRepository);
        
        await deleteUseCase.execute(
          (authenticatedRequest.params as { id: string }).id,
          authenticatedRequest.user.id
        );

        return reply.status(204).send();
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Finance settings not found') {
            return reply.status(404).send(
              ResponseHelper.notFound('Configurações financeiras')
            );
          }
          
          if (error.message === 'Unauthorized') {
            return reply.status(401).send(
              ResponseHelper.unauthorized()
            );
          }
        }
        
        fastify.log.error(error);
        return reply.status(500).send(
          ResponseHelper.internalServerError(error as Error)
        );
      }
    }
  });
};

export default userFinanceSettingsRoutes;
export const autoPrefix = '/user-finance-settings';