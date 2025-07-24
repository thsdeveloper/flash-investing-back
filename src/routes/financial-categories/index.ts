import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { AuthenticatedRequest } from '../../shared/types/authenticated-request'
import { authMiddleware } from '../../infrastructure/http/middlewares/auth-middleware'
import { FinanceValidationMiddleware } from '../../infrastructure/http/middlewares/finance-validation-middleware'
import { prisma } from '../../infrastructure/database/prisma-client'
import { PrismaFinancialCategoryRepository } from '../../infrastructure/database/repositories/prisma-financial-category-repository'
import { CreateFinancialCategoryUseCase } from '../../application/use-cases/create-financial-category'
import { UpdateFinancialCategoryUseCase } from '../../application/use-cases/update-financial-category'
import { ListFinancialCategoriesUseCase } from '../../application/use-cases/list-financial-categories'
import { GetFinancialCategoryUseCase } from '../../application/use-cases/get-financial-category'
import { DeleteFinancialCategoryUseCase } from '../../application/use-cases/delete-financial-category'
import { GetFinancialCategoryStatsUseCase } from '../../application/use-cases/get-financial-category-stats'
import { ReorderFinancialCategoriesUseCase } from '../../application/use-cases/reorder-financial-categories'
import {
  createFinancialCategoryBodySchema,
  updateFinancialCategoryBodySchema,
  listFinancialCategoriesQuerySchema,
  financialCategoryResponseSchema,
  financialCategoryStatsResponseSchema,
  listFinancialCategoriesResponseSchema,
  financialCategoryParamsSchema,
  reorderFinancialCategoriesBodySchema,
  errorResponseSchema
} from '../../schemas/financial-category'

const financialCategoriesRoutes: FastifyPluginAsync = async function (fastify) {
  const repository = new PrismaFinancialCategoryRepository(prisma)
  const createUseCase = new CreateFinancialCategoryUseCase(repository)
  const updateUseCase = new UpdateFinancialCategoryUseCase(repository)
  const listUseCase = new ListFinancialCategoriesUseCase(repository)
  const getUseCase = new GetFinancialCategoryUseCase(repository)
  const deleteUseCase = new DeleteFinancialCategoryUseCase(repository)
  const statsUseCase = new GetFinancialCategoryStatsUseCase(repository)
  const reorderUseCase = new ReorderFinancialCategoriesUseCase(repository)
  
  // Middleware de validação
  const financeValidation = new FinanceValidationMiddleware(prisma)

  // Create category
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      description: 'Create a new financial category',
      tags: ['Financial Categories'],
      body: createFinancialCategoryBodySchema,
      response: {
        201: financialCategoryResponseSchema,
        400: errorResponseSchema
      }
    },
    preHandler: [
      authMiddleware,
      financeValidation.validateBudgetRequired,
      financeValidation.validateCategoryCreation
    ],
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

  // List categories
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      description: 'List financial categories',
      tags: ['Financial Categories'],
      querystring: listFinancialCategoriesQuerySchema,
      response: {
        200: listFinancialCategoriesResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: async (request: AuthenticatedRequest, reply) => {
      const result = await listUseCase.execute({
        ...request.query,
        userId: request.user.id
      })
      return reply.send(result)
    }
  })

  // Get category stats
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/stats',
    schema: {
      description: 'Get financial category statistics',
      tags: ['Financial Categories'],
      response: {
        200: financialCategoryStatsResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: async (request: AuthenticatedRequest, reply) => {
      const result = await statsUseCase.execute(request.user.id)
      return reply.send(result)
    }
  })

  // Reorder categories
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/reorder',
    schema: {
      description: 'Reorder financial categories',
      tags: ['Financial Categories'],
      body: reorderFinancialCategoriesBodySchema,
      response: {
        204: z.null(),
        400: errorResponseSchema,
        403: errorResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        await reorderUseCase.execute(request.body, request.user.id)
        return reply.status(204).send()
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Category not found') {
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

  // Get category by ID
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    schema: {
      description: 'Get financial category by ID',
      tags: ['Financial Categories'],
      params: financialCategoryParamsSchema,
      response: {
        200: financialCategoryResponseSchema,
        404: errorResponseSchema,
        403: errorResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const result = await getUseCase.execute(request.params.id, request.user.id)
        
        if (!result) {
          return reply.status(404).send({ error: 'Category not found' })
        }
        
        return reply.send(result)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Unauthorized') {
            return reply.status(403).send({ error: error.message })
          }
        }
        throw error
      }
    }
  })

  // Update category
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/:id',
    schema: {
      description: 'Update financial category',
      tags: ['Financial Categories'],
      params: financialCategoryParamsSchema,
      body: updateFinancialCategoryBodySchema,
      response: {
        200: financialCategoryResponseSchema,
        400: errorResponseSchema,
        404: errorResponseSchema,
        403: errorResponseSchema
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
          if (error.message === 'Category not found') {
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

  // Delete category
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      description: 'Delete financial category',
      tags: ['Financial Categories'],
      params: financialCategoryParamsSchema,
      response: {
        204: z.null(),
        400: errorResponseSchema,
        404: errorResponseSchema,
        403: errorResponseSchema
      }
    },
    preHandler: [
      authMiddleware,
      financeValidation.validateCategoryDeletion
    ],
    handler: async (request: AuthenticatedRequest, reply) => {
      // Verificação de segurança: se a resposta já foi enviada, não continuar
      if (reply.sent) {
        console.log('⚠️ [DELETE Handler] Resposta já foi enviada, ignorando handler')
        return
      }
      
      console.log('🎯 [DELETE Handler] Iniciando exclusão da categoria:', request.params.id)
      try {
        await deleteUseCase.execute(request.params.id, request.user.id)
        console.log('✅ [DELETE Handler] Categoria excluída com sucesso')
        return reply.status(204).send()
      } catch (error) {
        console.log('❌ [DELETE Handler] Erro ao excluir categoria:', error)
        if (error instanceof Error) {
          if (error.message === 'Category not found') {
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

export default financialCategoriesRoutes
export const autoPrefix = '/financial-categories'