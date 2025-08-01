import { FinancialCategoryRepository } from '@src/modules/financial-categories/domain/contracts/financial-category-repository'
import { ReorderFinancialCategoriesDto } from '@src/modules/financial-categories/application/dtos/financial-category-dtos'

export class ReorderFinancialCategoriesUseCase {
  constructor(private financialCategoryRepository: FinancialCategoryRepository) {}

  async execute(dto: ReorderFinancialCategoriesDto, userId: string): Promise<void> {
    // Verify that all categories belong to the user
    for (const update of dto.categoryUpdates) {
      const category = await this.financialCategoryRepository.findById(update.id)
      
      if (!category) {
        throw new Error(`Category with ID ${update.id} not found`)
      }

      if (!category.belongsToUser(userId)) {
        throw new Error(`Unauthorized access to category ${update.id}`)
      }
    }

    // Perform the reorder operation
    await this.financialCategoryRepository.reorder(dto.categoryUpdates)
  }
}