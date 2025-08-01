import {AssetRiskLevel, AssetType} from "@src/modules/investments/domain/entities/investment-asset";
import {
  RecommendationReason,
  RecommendationType
} from "@src/modules/investments/domain/entities/investment-recommendation";

export interface CreateInvestmentPortfolioDto {
  name: string;
  description?: string;
  userId: string;
}

export interface UpdateInvestmentPortfolioDto {
  name?: string;
  description?: string;
}

export interface CreateInvestmentAssetDto {
  symbol: string;
  name: string;
  type: AssetType;
  riskLevel: AssetRiskLevel;
  sector?: string;
  currentPrice: number;
  currency: string;
  isActive: boolean;
}

export interface UpdateInvestmentAssetDto {
  name?: string;
  riskLevel?: AssetRiskLevel;
  sector?: string;
  currentPrice?: number;
  isActive?: boolean;
}

export interface CreatePortfolioPositionDto {
  portfolioId: string;
  assetId: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
}

export interface UpdatePortfolioPositionDto {
  quantity?: number;
  averagePrice?: number;
  currentPrice?: number;
}

export interface CreateInvestmentRecommendationDto {
  userId: string;
  assetId: string;
  type: RecommendationType;
  reason: RecommendationReason;
  targetPrice?: number;
  stopLoss?: number;
  confidence: number;
  description: string;
  isActive: boolean;
  expiresAt?: Date;
}

export interface UpdateInvestmentRecommendationDto {
  type?: RecommendationType;
  reason?: RecommendationReason;
  targetPrice?: number;
  stopLoss?: number;
  confidence?: number;
  description?: string;
  isActive?: boolean;
  expiresAt?: Date;
}