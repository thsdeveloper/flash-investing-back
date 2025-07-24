import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { AuthenticatedRequest } from '../../shared/types/authenticated-request'
import { authMiddleware } from '../../infrastructure/http/middlewares/auth-middleware'
import { prisma } from '../../infrastructure/database/prisma-client'
import { PrismaUserFinanceSettingsRepository } from '../../infrastructure/database/repositories/prisma-user-finance-settings-repository'
import { CreateUserFinanceSettingsUseCase } from '../../application/use-cases/create-user-finance-settings'
import { UpdateUserFinanceSettingsUseCase } from '../../application/use-cases/update-user-finance-settings'
import { GetUserFinanceSettingsUseCase } from '../../application/use-cases/get-user-finance-settings'
import { DeleteUserFinanceSettingsUseCase } from '../../application/use-cases/delete-user-finance-settings'
import {
  createUserFinanceSettingsBodySchema,
  updateUserFinanceSettingsBodySchema,
  userFinanceSettingsResponseSchema,
  getUserFinanceSettingsResponseSchema,
  userFinanceSettingsParamsSchema
} from '../../schemas/user-finance-settings'

const userFinanceSettingsRoutes: FastifyPluginAsync = async function (fastify) {
  const repository = new PrismaUserFinanceSettingsRepository(prisma)
  const createUseCase = new CreateUserFinanceSettingsUseCase(repository)
  const updateUseCase = new UpdateUserFinanceSettingsUseCase(repository)
  const getUseCase = new GetUserFinanceSettingsUseCase(repository)
  const deleteUseCase = new DeleteUserFinanceSettingsUseCase(repository)

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      description: 'Create user finance settings',
      tags: ['Finance Settings'],
      body: createUserFinanceSettingsBodySchema,
      response: {
        201: userFinanceSettingsResponseSchema,
        400: z.object({
          error: z.string()
        })
      }
    },
    preHandler: authMiddleware,
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const result = await createUseCase.execute({
          ...request.body,
          userId: request.user.id
        })
        return reply.status(201).send(result)
      } catch (error) {
        if (error instanceof Error) {
          return reply.status(400).send({ error: error.message })
        }
        throw error
      }
    }
  })

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      description: 'Get user finance settings',
      tags: ['Finance Settings'],
      response: {
        200: getUserFinanceSettingsResponseSchema.nullable(),
        404: z.object({
          error: z.string()
        })
      }
    },
    preHandler: authMiddleware,
    handler: async (request: AuthenticatedRequest, reply) => {
      const result = await getUseCase.execute(request.user.id)
      
      if (!result) {
        return reply.status(404).send({ error: 'Finance settings not found' })
      }
      
      return reply.send(result)
    }
  })

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/:id',
    schema: {
      description: 'Update user finance settings',
      tags: ['Finance Settings'],
      params: userFinanceSettingsParamsSchema,
      body: updateUserFinanceSettingsBodySchema,
      response: {
        200: userFinanceSettingsResponseSchema,
        400: z.object({
          error: z.string()
        }),
        404: z.object({
          error: z.string()
        })
      }
    },
    preHandler: authMiddleware,
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const result = await updateUseCase.execute(
          request.params.id,
          request.user.id,
          request.body
        )
        return reply.send(result)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Finance settings not found') {
            return reply.status(404).send({ error: error.message })
          }
          if (error.message === 'Unauthorized') {
            return reply.status(403).send({ error: error.message })
          }
          return reply.status(400).send({ error: error.message })
        }
        throw error
      }
    }
  })

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      description: 'Delete user finance settings',
      tags: ['Finance Settings'],
      params: userFinanceSettingsParamsSchema,
      response: {
        204: z.null(),
        404: z.object({
          error: z.string()
        }),
        403: z.object({
          error: z.string()
        })
      }
    },
    preHandler: authMiddleware,
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        await deleteUseCase.execute(request.params.id, request.user.id)
        return reply.status(204).send()
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Finance settings not found') {
            return reply.status(404).send({ error: error.message })
          }
          if (error.message === 'Unauthorized') {
            return reply.status(403).send({ error: error.message })
          }
        }
        throw error
      }
    }
  })
}

export default userFinanceSettingsRoutes
export const autoPrefix = '/user-finance-settings'