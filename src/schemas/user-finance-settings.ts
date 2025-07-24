import { z } from 'zod'

export const createUserFinanceSettingsBodySchema = z.object({
  salary: z.number().min(0, 'Salary must be positive'),
  fixed: z.number().int().min(0).max(100),
  variable: z.number().int().min(0).max(100),
  investments: z.number().int().min(0).max(100)
}).refine(
  data => data.fixed + data.variable + data.investments === 100,
  { message: 'The sum of percentages must equal 100' }
)

export const updateUserFinanceSettingsBodySchema = z.object({
  salary: z.number().min(0, 'Salary must be positive').optional(),
  fixed: z.number().int().min(0).max(100).optional(),
  variable: z.number().int().min(0).max(100).optional(),
  investments: z.number().int().min(0).max(100).optional()
}).refine(
  data => {
    if (data.fixed !== undefined || data.variable !== undefined || data.investments !== undefined) {
      const hasAllPercentages = data.fixed !== undefined && data.variable !== undefined && data.investments !== undefined
      if (!hasAllPercentages) {
        return false
      }
      return data.fixed! + data.variable! + data.investments! === 100
    }
    return true
  },
  { message: 'When updating percentages, all three must be provided and sum to 100' }
)

export const userFinanceSettingsResponseSchema = z.object({
  id: z.string().uuid(),
  salary: z.number(),
  fixed: z.number(),
  variable: z.number(),
  investments: z.number(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const userFinanceSettingsBudgetSchema = z.object({
  fixed: z.number(),
  variable: z.number(),
  investments: z.number(),
  total: z.number()
})

export const getUserFinanceSettingsResponseSchema = userFinanceSettingsResponseSchema.extend({
  budgets: userFinanceSettingsBudgetSchema
})

export const userFinanceSettingsParamsSchema = z.object({
  id: z.string().uuid()
})