import { randomUUID } from 'crypto';
import { FinancialCategory } from '@src/modules/financial-categories/domain/entities/financial-category'
import { FinancialCategoryRepository } from '@src/modules/financial-categories/domain/contracts/financial-category-repository'
import { CreateFinancialCategoryDto, FinancialCategoryResponseDto } from '@src/modules/financial-categories/application/dtos/financial-category-dtos'

export class CreateFinancialCategoryUseCase {
  constructor(private financialCategoryRepository: FinancialCategoryRepository) {}

  async execute(dto: CreateFinancialCategoryDto): Promise<FinancialCategoryResponseDto> {
    const isNameUnique = await this.financialCategoryRepository.checkNameUniqueness(
      dto.userId, 
      dto.nome.trim()
    )

    if (!isNameUnique) {
      throw new Error('A category with this name already exists')
    }

    const nextSort = await this.getNextSortValue(dto.userId, dto.tipo)

    const category = FinancialCategory.create({
      id: randomUUID(),
      nome: dto.nome.trim(),
      descricao: dto.descricao,
      icone: dto.icone,
      cor: dto.cor,
      tipo: dto.tipo,
      ativa: dto.ativa ?? true,
      ruleCategory: dto.ruleCategory,
      sort: dto.sort ?? nextSort,
      status: dto.status ?? 'published',
      userId: dto.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const savedCategory = await this.financialCategoryRepository.create(category)

    return this.mapToResponseDto(savedCategory)
  }

  private async getNextSortValue(userId: string, tipo: 'receita' | 'despesa'): Promise<number> {
    const categories = await this.financialCategoryRepository.findMany({
      userId,
      tipo,
      sortBy: 'sort',
      sortOrder: 'desc',
      limit: 1
    })

    if (categories.length === 0) {
      return 1
    }

    return categories[0].sort + 1
  }

  private mapToResponseDto(category: FinancialCategory): FinancialCategoryResponseDto {
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