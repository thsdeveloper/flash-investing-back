import { z } from 'zod';

/**
 * Estrutura padronizada de resposta da API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  errors: string[] | null;
  meta: {
    timestamp: string;
    version: string;
  };
}

/**
 * Estrutura padronizada de resposta com paginação
 */
export interface PaginatedApiResponse<T = any> extends ApiResponse<{
  items: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}> {}

/**
 * Configuração para construção de respostas
 */
interface ResponseConfig {
  message?: string;
  version?: string;
}

/**
 * Helper para criar respostas padronizadas de sucesso
 */
export class ResponseHelper {
  private static readonly DEFAULT_VERSION = '1.0.0';

  /**
   * Cria uma resposta de sucesso
   */
  static success<T>(data: T, config: ResponseConfig = {}): ApiResponse<T> {
    return {
      success: true,
      data,
      message: config.message || 'Operação realizada com sucesso',
      errors: null,
      meta: {
        timestamp: new Date().toISOString(),
        version: config.version || this.DEFAULT_VERSION
      }
    };
  }

  /**
   * Cria uma resposta de sucesso com paginação
   */
  static successPaginated<T>(
    items: T[],
    currentPage: number,
    totalPages: number,
    totalItems: number,
    itemsPerPage: number,
    config: ResponseConfig = {}
  ): PaginatedApiResponse<T> {
    return {
      success: true,
      data: {
        items,
        pagination: {
          current_page: currentPage,
          total_pages: totalPages,
          total_items: totalItems,
          items_per_page: itemsPerPage
        }
      },
      message: config.message || 'Dados recuperados com sucesso',
      errors: null,
      meta: {
        timestamp: new Date().toISOString(),
        version: config.version || this.DEFAULT_VERSION
      }
    };
  }

  /**
   * Cria uma resposta de erro
   */
  static error(
    message: string,
    errors: string[] = [],
    config: ResponseConfig = {}
  ): ApiResponse<null> {
    return {
      success: false,
      data: null,
      message,
      errors: errors.length > 0 ? errors : [message],
      meta: {
        timestamp: new Date().toISOString(),
        version: config.version || this.DEFAULT_VERSION
      }
    };
  }

  /**
   * Cria uma resposta de erro de validação
   */
  static validationError(
    errors: string[],
    config: ResponseConfig = {}
  ): ApiResponse<null> {
    return this.error(
      'Erro de validação',
      errors,
      config
    );
  }

  /**
   * Cria uma resposta de erro não encontrado
   */
  static notFound(
    resource: string = 'Recurso',
    config: ResponseConfig = {}
  ): ApiResponse<null> {
    return this.error(
      `${resource} não encontrado`,
      [`${resource.toUpperCase()}_NOT_FOUND`],
      config
    );
  }

  /**
   * Cria uma resposta de erro não autorizado
   */
  static unauthorized(
    config: ResponseConfig = {}
  ): ApiResponse<null> {
    return this.error(
      'Não autorizado',
      ['UNAUTHORIZED'],
      config
    );
  }

  /**
   * Cria uma resposta de erro interno do servidor
   */
  static internalServerError(
    error?: Error,
    config: ResponseConfig = {}
  ): ApiResponse<null> {
    return this.error(
      'Erro interno do servidor',
      [error?.message || 'INTERNAL_SERVER_ERROR'],
      config
    );
  }
}

/**
 * Schemas Zod para validação de respostas
 */
export const baseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  errors: z.array(z.string()).nullable(),
  meta: z.object({
    timestamp: z.string(),
    version: z.string()
  })
});

export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  baseResponseSchema.extend({
    success: z.literal(true),
    data: dataSchema
  });

export const errorResponseSchema = baseResponseSchema.extend({
  success: z.literal(false),
  data: z.null()
});

export const paginationSchema = z.object({
  current_page: z.number(),
  total_pages: z.number(),
  total_items: z.number(),
  items_per_page: z.number()
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  baseResponseSchema.extend({
    success: z.literal(true),
    data: z.object({
      items: z.array(itemSchema),
      pagination: paginationSchema
    })
  });