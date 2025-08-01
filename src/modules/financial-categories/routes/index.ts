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
  PrismaFinancialCategoryRepository
} from "@src/modules/financial-categories/infrastructure/repositories/prisma-financial-category-repository";
import {
  ListFinancialCategoriesUseCase
} from "@src/modules/financial-categories/application/use-cases/list-financial-categories";
import {
  GetFinancialCategoryUseCase
} from "@src/modules/financial-categories/application/use-cases/get-financial-category";
import {
  GetFinancialCategoryStatsUseCase
} from "@src/modules/financial-categories/application/use-cases/get-financial-category-stats";
import {
  CreateFinancialCategoryUseCase
} from "@src/modules/financial-categories/application/use-cases/create-financial-category";
import {
  UpdateFinancialCategoryUseCase
} from "@src/modules/financial-categories/application/use-cases/update-financial-category";
import {
  DeleteFinancialCategoryUseCase
} from "@src/modules/financial-categories/application/use-cases/delete-financial-category";
import {
  ReorderFinancialCategoriesUseCase
} from "@src/modules/financial-categories/application/use-cases/reorder-financial-categories";
import {
  BulkUpdateFinancialCategoriesUseCase
} from "@src/modules/financial-categories/application/use-cases/bulk-update-financial-categories";
import {
  financialCategoryResponseSchema,
  financialCategoryStatsResponseSchema,
  createFinancialCategoryBodySchema,
  updateFinancialCategoryBodySchema,
  listFinancialCategoriesQuerySchema,
  financialCategoryParamsSchema,
  reorderFinancialCategoriesBodySchema,
  bulkUpdateFinancialCategoriesBodySchema
} from "@src/modules/financial-categories/schemas/financial-category";

const financialCategoriesRoutes: FastifyPluginAsync = async function (fastify) {
  const financialCategoryRepository = new PrismaFinancialCategoryRepository(prisma);

  // GET /financial-categories - Listar categorias financeiras
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Listar categorias financeiras do usuário',
      tags: ['Financial Categories'],
      security: [{ bearerAuth: [] }],
      querystring: listFinancialCategoriesQuerySchema,
      response: {
        200: standardPaginatedResponseSchema(financialCategoryResponseSchema),
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const query = request.query as any;
        const listCategoriesUseCase = new ListFinancialCategoriesUseCase(financialCategoryRepository);
        const result = await listCategoriesUseCase.execute({
          userId: (request as AuthenticatedRequest).user.id,
          tipo: query.tipo,
          ativa: query.ativa,
          ruleCategory: query.ruleCategory,
          status: query.status,
          search: query.search,
          limit: query.limit,
          offset: query.offset,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        });
        
        const response = ResponseHelper.successPaginated(
          result.data,
          Math.floor(result.meta.offset / result.meta.limit) + 1, // current page
          Math.ceil(result.meta.total / result.meta.limit), // total pages
          result.meta.total,
          result.data.length,
          { message: 'Categorias financeiras recuperadas com sucesso' }
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

  // GET /financial-categories/stats - Estatísticas das categorias
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/stats',
    preHandler: authMiddleware,
    schema: {
      description: 'Obter estatísticas das categorias financeiras do usuário',
      tags: ['Financial Categories'],
      security: [{ bearerAuth: [] }],
      response: {
        200: standardSuccessResponseSchema(financialCategoryStatsResponseSchema),
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const getStatsUseCase = new GetFinancialCategoryStatsUseCase(financialCategoryRepository);
        const result = await getStatsUseCase.execute((request as AuthenticatedRequest).user.id);
        
        const response = ResponseHelper.success(
          result,
          { message: 'Estatísticas das categorias recuperadas com sucesso' }
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

  // GET /financial-categories/:id - Buscar categoria financeira por ID
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Buscar categoria financeira por ID',
      tags: ['Financial Categories'],
      security: [{ bearerAuth: [] }],
      params: financialCategoryParamsSchema,
      response: {
        200: standardSuccessResponseSchema(financialCategoryResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        404: standardError404Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const getCategoryUseCase = new GetFinancialCategoryUseCase(financialCategoryRepository);
        const { id } = request.params as { id: string };
        const result = await getCategoryUseCase.execute(id, (request as AuthenticatedRequest).user.id);
        
        if (!result) {
          const response = ResponseHelper.notFound('Categoria financeira');
          return reply.status(404).send(response as any);
        }
        
        const response = ResponseHelper.success(
          result,
          { message: 'Categoria financeira recuperada com sucesso' }
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
        
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          const response = ResponseHelper.error(
            'Acesso negado à categoria financeira',
            ['UNAUTHORIZED']
          );
          return reply.status(403).send(response as any);
        }
        
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any);
      }
    },
  });

  // POST /financial-categories - Criar nova categoria financeira
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Criar nova categoria financeira',
      tags: ['Financial Categories'],
      security: [{ bearerAuth: [] }],
      body: createFinancialCategoryBodySchema,
      response: {
        201: standardSuccessResponseSchema(financialCategoryResponseSchema),
        400: standardError400Schema,
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const body = request.body as any;
        const createCategoryUseCase = new CreateFinancialCategoryUseCase(financialCategoryRepository);
        const result = await createCategoryUseCase.execute({
          nome: body.nome,
          descricao: body.descricao,
          icone: body.icone,
          cor: body.cor,
          tipo: body.tipo,
          ativa: body.ativa,
          ruleCategory: body.ruleCategory,
          sort: body.sort,
          status: body.status,
          userId: (request as AuthenticatedRequest).user.id,
        });
        
        const response = ResponseHelper.success(
          result,
          { message: 'Categoria financeira criada com sucesso' }
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
        
        if (error instanceof Error && error.message.includes('already exists')) {
          const response = ResponseHelper.error(
            'Já existe uma categoria com este nome',
            ['CATEGORY_NAME_ALREADY_EXISTS']
          );
          return reply.status(400).send(response as any);
        }
        
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any);
      }
    },
  });

  // PATCH /financial-categories/:id - Atualizar categoria financeira
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Atualizar categoria financeira',
      tags: ['Financial Categories'],
      security: [{ bearerAuth: [] }],
      params: financialCategoryParamsSchema,
      body: updateFinancialCategoryBodySchema,
      response: {
        200: standardSuccessResponseSchema(financialCategoryResponseSchema),
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
        const updateCategoryUseCase = new UpdateFinancialCategoryUseCase(financialCategoryRepository);
        const result = await updateCategoryUseCase.execute(
          id,
          (request as AuthenticatedRequest).user.id,
          {
            nome: body.nome,
            descricao: body.descricao,
            icone: body.icone,
            cor: body.cor,
            ativa: body.ativa,
            ruleCategory: body.ruleCategory,
            sort: body.sort,
            status: body.status,
          }
        );
        
        const response = ResponseHelper.success(
          result,
          { message: 'Categoria financeira atualizada com sucesso' }
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
        
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            const response = ResponseHelper.notFound('Categoria financeira');
            return reply.status(404).send(response as any);
          }
          
          if (error.message.includes('Unauthorized')) {
            const response = ResponseHelper.error(
              'Acesso negado à categoria financeira',
              ['UNAUTHORIZED']
            );
            return reply.status(403).send(response as any);
          }
          
          if (error.message.includes('already exists')) {
            const response = ResponseHelper.error(
              'Já existe uma categoria com este nome',
              ['CATEGORY_NAME_ALREADY_EXISTS']
            );
            return reply.status(400).send(response as any);
          }
        }
        
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any);
      }
    },
  });

  // DELETE /financial-categories/:id - Deletar categoria financeira
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Deletar categoria financeira',
      tags: ['Financial Categories'],
      security: [{ bearerAuth: [] }],
      params: financialCategoryParamsSchema,
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
        const { id } = request.params as { id: string };
        const deleteCategoryUseCase = new DeleteFinancialCategoryUseCase(financialCategoryRepository);
        await deleteCategoryUseCase.execute(id, (request as AuthenticatedRequest).user.id);
        
        const response = ResponseHelper.success(
          null,
          { message: 'Categoria financeira removida com sucesso' }
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
        
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            const response = ResponseHelper.notFound('Categoria financeira');
            return reply.status(404).send(response as any);
          }
          
          if (error.message.includes('Unauthorized')) {
            const response = ResponseHelper.error(
              'Acesso negado à categoria financeira',
              ['UNAUTHORIZED']
            );
            return reply.status(403).send(response as any);
          }
        }
        
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any);
      }
    },
  });

  // POST /financial-categories/reorder - Reordenar categorias financeiras
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/reorder',
    preHandler: authMiddleware,
    schema: {
      description: 'Reordenar categorias financeiras',
      tags: ['Financial Categories'],
      security: [{ bearerAuth: [] }],
      body: reorderFinancialCategoriesBodySchema,
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
        const body = request.body as any;
        const reorderCategoriesUseCase = new ReorderFinancialCategoriesUseCase(financialCategoryRepository);
        await reorderCategoriesUseCase.execute(
          {
            categoryUpdates: body.categoryUpdates
          },
          (request as AuthenticatedRequest).user.id
        );
        
        const response = ResponseHelper.success(
          null,
          { message: 'Categorias reordenadas com sucesso' }
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
        
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            const response = ResponseHelper.error(
              'Uma ou mais categorias não foram encontradas',
              ['CATEGORY_NOT_FOUND']
            );
            return reply.status(404).send(response as any);
          }
          
          if (error.message.includes('Unauthorized')) {
            const response = ResponseHelper.error(
              'Acesso negado a uma ou mais categorias',
              ['UNAUTHORIZED']
            );
            return reply.status(403).send(response as any);
          }
        }
        
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any);
      }
    },
  });

  // PATCH /financial-categories/bulk-update - Atualização em lote
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/bulk-update',
    preHandler: authMiddleware,
    schema: {
      description: 'Atualizar múltiplas categorias financeiras em lote',
      tags: ['Financial Categories'],
      security: [{ bearerAuth: [] }],
      body: bulkUpdateFinancialCategoriesBodySchema,
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
        const body = request.body as any;
        const bulkUpdateCategoriesUseCase = new BulkUpdateFinancialCategoriesUseCase(financialCategoryRepository);
        await bulkUpdateCategoriesUseCase.execute(
          {
            categoryIds: body.categoryIds,
            updates: body.updates
          },
          (request as AuthenticatedRequest).user.id
        );
        
        const response = ResponseHelper.success(
          null,
          { message: 'Categorias atualizadas em lote com sucesso' }
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
        
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            const response = ResponseHelper.error(
              'Uma ou mais categorias não foram encontradas',
              ['CATEGORY_NOT_FOUND']
            );
            return reply.status(404).send(response as any);
          }
          
          if (error.message.includes('Unauthorized')) {
            const response = ResponseHelper.error(
              'Acesso negado a uma ou mais categorias',
              ['UNAUTHORIZED']
            );
            return reply.status(403).send(response as any);
          }
        }
        
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any);
      }
    },
  });
};

export default financialCategoriesRoutes;
export const autoPrefix = '/financial-categories';