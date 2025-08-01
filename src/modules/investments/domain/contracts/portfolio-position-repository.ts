import {PortfolioPosition} from "@src/modules/investments/domain/entities/portfolio-position";

export interface PortfolioPositionRepository {
  create(position: PortfolioPosition): Promise<PortfolioPosition>;
  findById(id: string): Promise<PortfolioPosition | null>;
  findByPortfolioId(portfolioId: string): Promise<PortfolioPosition[]>;
  findByAssetId(assetId: string): Promise<PortfolioPosition[]>;
  findByPortfolioAndAsset(portfolioId: string, assetId: string): Promise<PortfolioPosition | null>;
  update(position: PortfolioPosition): Promise<PortfolioPosition>;
  delete(id: string): Promise<void>;
}