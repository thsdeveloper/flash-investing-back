import {
  InvestmentRecommendationRepository
} from "@src/modules/investments/domain/contracts/investment-recommendation-repository";
import {InvestmentRecommendation} from "@src/modules/investments/domain/entities/investment-recommendation";

export class GetInvestmentRecommendationsUseCase {
  constructor(
    private investmentRecommendationRepository: InvestmentRecommendationRepository
  ) {}

  async execute(userId: string, activeOnly: boolean = false): Promise<InvestmentRecommendation[]> {
    if (activeOnly) {
      return await this.investmentRecommendationRepository.findActiveByUserId(userId);
    }
    
    return await this.investmentRecommendationRepository.findByUserId(userId);
  }
}