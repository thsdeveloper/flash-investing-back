import {InvestmentPortfolioRepository} from "@src/modules/investments/domain/contracts/investment-portfolio-repository";
import {InvestmentPortfolio} from "@src/modules/investments/domain/entities/investment-portfolio";

export class GetInvestmentPortfoliosUseCase {
  constructor(
    private investmentPortfolioRepository: InvestmentPortfolioRepository
  ) {}

  async execute(userId: string): Promise<InvestmentPortfolio[]> {
    return await this.investmentPortfolioRepository.findByUserId(userId);
  }
}