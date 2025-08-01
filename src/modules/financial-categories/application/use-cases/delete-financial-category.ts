import { FinancialCategoryRepository } from '@src/modules/financial-categories/domain/contracts/financial-category-repository'

export class DeleteFinancialCategoryUseCase {
  constructor(private financialCategoryRepository: FinancialCategoryRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const category = await this.financialCategoryRepository.findById(id)
    
    if (!category) {
      throw new Error('Category not found')
    }

    if (!category.belongsToUser(userId)) {
      throw new Error('Unauthorized')
    }

    // Optional: Check if category is being used in transactions
    // This would require adding a method to check category usage
    // For now, we'll allow deletion and let the database handle foreign key constraints

    await this.financialCategoryRepository.delete(id)
  }
}