import { FinancialCategoryRepository } from '../../domain/contracts/financial-category-repository'
import { FinancialCategoryStatsDto } from '../dtos/financial-category-dtos'

export class GetFinancialCategoryStatsUseCase {
  constructor(private financialCategoryRepository: FinancialCategoryRepository) {}

  async execute(userId: string): Promise<FinancialCategoryStatsDto> {
    const stats = await this.financialCategoryRepository.getStats(userId)
    
    return {
      totalCategories: stats.totalCategories,
      activeCategories: stats.activeCategories,
      receitaCategories: stats.receitaCategories,
      despesaCategories: stats.despesaCategories,
      categoriesByRule: stats.categoriesByRule
    }
  }
}