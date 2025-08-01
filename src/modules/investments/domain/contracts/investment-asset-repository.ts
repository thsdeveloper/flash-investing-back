import {AssetType, InvestmentAsset} from "@src/modules/investments/domain/entities/investment-asset";

export interface InvestmentAssetRepository {
  create(asset: InvestmentAsset): Promise<InvestmentAsset>;
  findById(id: string): Promise<InvestmentAsset | null>;
  findBySymbol(symbol: string): Promise<InvestmentAsset | null>;
  findByType(type: AssetType): Promise<InvestmentAsset[]>;
  findActive(): Promise<InvestmentAsset[]>;
  update(asset: InvestmentAsset): Promise<InvestmentAsset>;
  delete(id: string): Promise<void>;
}