import {
  InvestmentRecommendationRepository
} from "@src/modules/investments/domain/contracts/investment-recommendation-repository";
import {CreateInvestmentRecommendationDto} from "@src/modules/investments/application/dtos/investment-dtos";
import {InvestmentRecommendation} from "@src/modules/investments/domain/entities/investment-recommendation";

export class CreateInvestmentRecommendationUseCase {
  constructor(
    private investmentRecommendationRepository: InvestmentRecommendationRepository
  ) {}

  async execute(dto: CreateInvestmentRecommendationDto): Promise<InvestmentRecommendation> {
    const recommendation = InvestmentRecommendation.create({
      userId: dto.userId,
      assetId: dto.assetId,
      type: dto.type,
      reason: dto.reason,
      targetPrice: dto.targetPrice,
      stopLoss: dto.stopLoss,
      confidence: dto.confidence,
      description: dto.description,
      isActive: dto.isActive,
      expiresAt: dto.expiresAt,
    });

    return await this.investmentRecommendationRepository.create(recommendation);
  }
}