import { FinancialCategoryRepository } from '@src/modules/financial-categories/domain/contracts/financial-category-repository'
import { ListFinancialCategoriesDto, FinancialCategoryResponseDto } from '@src/modules/financial-categories/application/dtos/financial-category-dtos'

export interface ListFinancialCategoriesResult {
  data: FinancialCategoryResponseDto[]
  meta: {
    total: number
    limit: number
    offset: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

export class ListFinancialCategoriesUseCase {
  constructor(private financialCategoryRepository: FinancialCategoryRepository) {}

  async execute(dto: ListFinancialCategoriesDto): Promise<ListFinancialCategoriesResult> {
    const limit = dto.limit || 50
    const offset = dto.offset || 0

    const [categories, total] = await Promise.all([
      this.financialCategoryRepository.findMany({
        userId: dto.userId,
        tipo: dto.tipo,
        ativa: dto.ativa,
        ruleCategory: dto.ruleCategory,
        status: dto.status,
        search: dto.search,
        limit,
        offset,
        sortBy: dto.sortBy || 'sort',
        sortOrder: dto.sortOrder || 'asc'
      }),
      this.financialCategoryRepository.countByFilters({
        userId: dto.userId,
        tipo: dto.tipo,
        ativa: dto.ativa,
        ruleCategory: dto.ruleCategory,
        status: dto.status,
        search: dto.search
      })
    ])

    const hasNext = offset + limit < total
    const hasPrevious = offset > 0

    return {
      data: categories.map(category => this.mapToResponseDto(category)),
      meta: {
        total,
        limit,
        offset,
        hasNext,
        hasPrevious
      }
    }
  }

  private mapToResponseDto(category: any): FinancialCategoryResponseDto {
    return {
      id: category.id,
      nome: category.nome,
      descricao: category.descricao,
      icone: category.icone,
      cor: category.cor,
      tipo: category.tipo,
      ativa: category.ativa,
      ruleCategory: category.ruleCategory,
      sort: category.sort,
      status: category.status,
      userId: category.userId,
      createdAt: category.createdAt instanceof Date ? category.createdAt.toISOString() : category.createdAt,
      updatedAt: category.updatedAt instanceof Date ? category.updatedAt.toISOString() : category.updatedAt
    }
  }
}