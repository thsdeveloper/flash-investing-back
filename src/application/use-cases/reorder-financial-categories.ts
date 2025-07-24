import { FinancialCategoryRepository } from '../../domain/contracts/financial-category-repository'
import { ReorderFinancialCategoriesDto } from '../dtos/financial-category-dtos'

export class ReorderFinancialCategoriesUseCase {
  constructor(private financialCategoryRepository: FinancialCategoryRepository) {}

  async execute(dto: ReorderFinancialCategoriesDto, userId: string): Promise<void> {
    // Validate that all categories belong to the user
    const categoryIds = dto.categoryUpdates.map(update => update.id)
    
    const categories = await Promise.all(
      categoryIds.map(id => this.financialCategoryRepository.findById(id))
    )

    for (const category of categories) {
      if (!category) {
        throw new Error('Category not found')
      }
      if (!category.belongsToUser(userId)) {
        throw new Error('Unauthorized')
      }
    }

    // Perform the reordering
    await this.financialCategoryRepository.reorder(dto.categoryUpdates)
  }
}