export interface CreateFinancialCategoryDto {
  nome: string
  descricao?: string
  icone?: string
  cor?: string
  tipo: 'receita' | 'despesa'
  ativa?: boolean
  ruleCategory?: 'necessidades' | 'desejos' | 'futuro' | null
  sort?: number
  status?: 'published' | 'draft' | 'archived'
  userId: string
}

export interface UpdateFinancialCategoryDto {
  nome?: string
  descricao?: string
  icone?: string
  cor?: string
  ativa?: boolean
  ruleCategory?: 'necessidades' | 'desejos' | 'futuro' | null
  sort?: number
  status?: 'published' | 'draft' | 'archived'
}

export interface FinancialCategoryResponseDto {
  id: string
  nome: string
  descricao?: string
  icone?: string
  cor?: string
  tipo: 'receita' | 'despesa'
  ativa: boolean
  ruleCategory?: 'necessidades' | 'desejos' | 'futuro' | null
  sort: number
  status: 'published' | 'draft' | 'archived'
  userId: string
  createdAt: string
  updatedAt: string
}

export interface ListFinancialCategoriesDto {
  userId: string
  tipo?: 'receita' | 'despesa'
  ativa?: boolean
  ruleCategory?: 'necessidades' | 'desejos' | 'futuro' | null
  status?: 'published' | 'draft' | 'archived'
  search?: string
  limit?: number
  offset?: number
  sortBy?: 'nome' | 'tipo' | 'sort' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface FinancialCategoryStatsDto {
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

export interface BulkUpdateFinancialCategoriesDto {
  categoryIds: string[]
  updates: UpdateFinancialCategoryDto
}

export interface ReorderFinancialCategoriesDto {
  categoryUpdates: Array<{
    id: string
    sort: number
  }>
}