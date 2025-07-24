import { FinancialCategoryRepository } from '../../domain/contracts/financial-category-repository'
import { UpdateFinancialCategoryDto, FinancialCategoryResponseDto } from '../dtos/financial-category-dtos'

export class UpdateFinancialCategoryUseCase {
  constructor(private financialCategoryRepository: FinancialCategoryRepository) {}

  async execute(id: string, userId: string, dto: UpdateFinancialCategoryDto): Promise<FinancialCategoryResponseDto> {
    const category = await this.financialCategoryRepository.findById(id)
    
    if (!category) {
      throw new Error('Category not found')
    }

    if (!category.belongsToUser(userId)) {
      throw new Error('Unauthorized')
    }

    if (dto.nome) {
      const isNameUnique = await this.financialCategoryRepository.checkNameUniqueness(
        userId, 
        dto.nome.trim(),
        id
      )

      if (!isNameUnique) {
        throw new Error('A category with this name already exists')
      }
    }

    category.update(dto)

    const updatedCategory = await this.financialCategoryRepository.update(category)

    return this.mapToResponseDto(updatedCategory)
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