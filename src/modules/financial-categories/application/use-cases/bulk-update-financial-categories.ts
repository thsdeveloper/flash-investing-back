import { FinancialCategoryRepository } from '@src/modules/financial-categories/domain/contracts/financial-category-repository'
import { BulkUpdateFinancialCategoriesDto } from '@src/modules/financial-categories/application/dtos/financial-category-dtos'

export class BulkUpdateFinancialCategoriesUseCase {
  constructor(private financialCategoryRepository: FinancialCategoryRepository) {}

  async execute(dto: BulkUpdateFinancialCategoriesDto, userId: string): Promise<void> {
    // Verify that all categories belong to the user
    for (const categoryId of dto.categoryIds) {
      const category = await this.financialCategoryRepository.findById(categoryId)
      
      if (!category) {
        throw new Error(`Category with ID ${categoryId} not found`)
      }

      if (!category.belongsToUser(userId)) {
        throw new Error(`Unauthorized access to category ${categoryId}`)
      }
    }

    // Perform the bulk update operation
    await this.financialCategoryRepository.bulkUpdate(dto.categoryIds, dto.updates)
  }
}