import {
  InvestmentRecommendation,
  RecommendationType
} from "@src/modules/investments/domain/entities/investment-recommendation";

export interface InvestmentRecommendationRepository {
  create(recommendation: InvestmentRecommendation): Promise<InvestmentRecommendation>;
  findById(id: string): Promise<InvestmentRecommendation | null>;
  findByUserId(userId: string): Promise<InvestmentRecommendation[]>;
  findActiveByUserId(userId: string): Promise<InvestmentRecommendation[]>;
  findByAssetId(assetId: string): Promise<InvestmentRecommendation[]>;
  findByType(type: RecommendationType): Promise<InvestmentRecommendation[]>;
  update(recommendation: InvestmentRecommendation): Promise<InvestmentRecommendation>;
  delete(id: string): Promise<void>;
}