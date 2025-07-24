import { z } from 'zod'

// Enum schemas
export const categoryTypeSchema = z.enum(['receita', 'despesa'])
export const categoryRuleSchema = z.enum(['necessidades', 'desejos', 'futuro']).nullable()
export const categoryStatusSchema = z.enum(['published', 'draft', 'archived'])

// Hex color validation
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
export const hexColorSchema = z.string().regex(hexColorRegex, 'Invalid hex color format')

// Create category schema
export const createFinancialCategoryBodySchema = z.object({
  nome: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters').trim(),
  descricao: z.string().max(500, 'Description must be less than 500 characters').optional(),
  icone: z.string().max(50, 'Icon must be less than 50 characters').optional(),
  cor: hexColorSchema.optional(),
  tipo: categoryTypeSchema,
  ativa: z.boolean().default(true),
  ruleCategory: categoryRuleSchema.optional(),
  sort: z.number().int().min(0).optional(),
  status: categoryStatusSchema.default('published')
})

// Update category schema
export const updateFinancialCategoryBodySchema = z.object({
  nome: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters').trim().optional(),
  descricao: z.string().max(500, 'Description must be less than 500 characters').optional(),
  icone: z.string().max(50, 'Icon must be less than 50 characters').optional(),
  cor: hexColorSchema.optional(),
  ativa: z.boolean().optional(),
  ruleCategory: categoryRuleSchema.optional(),
  sort: z.number().int().min(0).optional(),
  status: categoryStatusSchema.optional()
})

// Query parameters for listing categories
export const listFinancialCategoriesQuerySchema = z.object({
  tipo: categoryTypeSchema.optional(),
  ativa: z.coerce.boolean().optional(),
  ruleCategory: categoryRuleSchema.optional(),
  status: categoryStatusSchema.optional(),
  search: z.string().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(['nome', 'tipo', 'sort', 'createdAt', 'updatedAt']).default('sort'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

// Response schemas
export const financialCategoryResponseSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  descricao: z.string().nullable(),
  icone: z.string().nullable(),
  cor: z.string().nullable(),
  tipo: categoryTypeSchema,
  ativa: z.boolean(),
  ruleCategory: categoryRuleSchema,
  sort: z.number(),
  status: categoryStatusSchema,
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const financialCategoryStatsResponseSchema = z.object({
  totalCategories: z.number(),
  activeCategories: z.number(),
  receitaCategories: z.number(),
  despesaCategories: z.number(),
  categoriesByRule: z.object({
    necessidades: z.number(),
    desejos: z.number(),
    futuro: z.number(),
    unclassified: z.number()
  })
})

export const listFinancialCategoriesResponseSchema = z.object({
  data: z.array(financialCategoryResponseSchema),
  meta: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean()
  })
})

// Path parameters
export const financialCategoryParamsSchema = z.object({
  id: z.string().uuid()
})

// Reorder categories schema
export const reorderFinancialCategoriesBodySchema = z.object({
  categoryUpdates: z.array(
    z.object({
      id: z.string().uuid(),
      sort: z.number().int().min(0)
    })
  ).min(1, 'At least one category update is required')
})

// Bulk update schema
export const bulkUpdateFinancialCategoriesBodySchema = z.object({
  categoryIds: z.array(z.string().uuid()).min(1, 'At least one category ID is required'),
  updates: z.object({
    ativa: z.boolean().optional(),
    status: categoryStatusSchema.optional(),
    ruleCategory: categoryRuleSchema.optional()
  }).refine(
    data => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  )
})

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string()
})