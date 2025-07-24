import { FinancialCategory } from '../entities/financial-category'

export interface FinancialCategoryFilters {
  userId: string
  tipo?: 'receita' | 'despesa'
  ativa?: boolean
  ruleCategory?: 'necessidades' | 'desejos' | 'futuro' | null
  status?: 'published' | 'draft' | 'archived'
  search?: string
}

export interface FinancialCategorySort {
  sortBy?: 'nome' | 'tipo' | 'sort' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface FinancialCategoryPagination {
  limit?: number
  offset?: number
}

export interface FinancialCategoryListOptions 
  extends FinancialCategoryFilters, FinancialCategorySort, FinancialCategoryPagination {}

export interface FinancialCategoryStats {
  totalCategories: number
  activeCategories: number
  receitaCategories: number
  despesaCategories: number
  categoriesByRule: {
    necessidades: number
    desejos: number
    futuro: number
    unclassified: number
  }
}

export interface FinancialCategoryRepository {
  create(category: FinancialCategory): Promise<FinancialCategory>
  update(category: FinancialCategory): Promise<FinancialCategory>
  findById(id: string): Promise<FinancialCategory | null>
  findByName(userId: string, nome: string): Promise<FinancialCategory | null>
  findByUser(userId: string): Promise<FinancialCategory[]>
  findMany(options: FinancialCategoryListOptions): Promise<FinancialCategory[]>
  countByFilters(filters: FinancialCategoryFilters): Promise<number>
  getStats(userId: string): Promise<FinancialCategoryStats>
  delete(id: string): Promise<void>
  bulkUpdate(categoryIds: string[], updates: Partial<FinancialCategory>): Promise<void>
  reorder(categoryUpdates: Array<{ id: string; sort: number }>): Promise<void>
  checkNameUniqueness(userId: string, nome: string, excludeId?: string): Promise<boolean>
}