import { FinancialCategoryRepository } from '../../domain/contracts/financial-category-repository'
import { FinancialCategoryResponseDto } from '../dtos/financial-category-dtos'

export class GetFinancialCategoryUseCase {
  constructor(private financialCategoryRepository: FinancialCategoryRepository) {}

  async execute(id: string, userId: string): Promise<FinancialCategoryResponseDto | null> {
    const category = await this.financialCategoryRepository.findById(id)
    
    if (!category) {
      return null
    }

    if (!category.belongsToUser(userId)) {
      throw new Error('Unauthorized')
    }

    return this.mapToResponseDto(category)
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