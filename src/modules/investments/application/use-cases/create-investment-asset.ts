import {InvestmentAssetRepository} from "@src/modules/investments/domain/contracts/investment-asset-repository";
import {InvestmentAsset} from "@src/modules/investments/domain/entities/investment-asset";
import {CreateInvestmentAssetDto} from "@src/modules/investments/application/dtos/investment-dtos";

export class CreateInvestmentAssetUseCase {
  constructor(
    private investmentAssetRepository: InvestmentAssetRepository
  ) {}

  async execute(dto: CreateInvestmentAssetDto): Promise<InvestmentAsset> {
    const existingAsset = await this.investmentAssetRepository.findBySymbol(dto.symbol);
    
    if (existingAsset) {
      throw new Error(`Asset with symbol ${dto.symbol} already exists`);
    }

    const asset = InvestmentAsset.create({
      symbol: dto.symbol,
      name: dto.name,
      type: dto.type,
      riskLevel: dto.riskLevel,
      sector: dto.sector,
      currentPrice: dto.currentPrice,
      currency: dto.currency,
      isActive: dto.isActive,
    });

    return await this.investmentAssetRepository.create(asset);
  }
}