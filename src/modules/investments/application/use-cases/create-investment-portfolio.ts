import {InvestmentPortfolioRepository} from "@src/modules/investments/domain/contracts/investment-portfolio-repository";
import {CreateInvestmentPortfolioDto} from "@src/modules/investments/application/dtos/investment-dtos";
import {InvestmentPortfolio} from "@src/modules/investments/domain/entities/investment-portfolio";

export class CreateInvestmentPortfolioUseCase {
  constructor(
    private investmentPortfolioRepository: InvestmentPortfolioRepository
  ) {}

  async execute(dto: CreateInvestmentPortfolioDto): Promise<InvestmentPortfolio> {
    const portfolio = InvestmentPortfolio.create({
      name: dto.name,
      description: dto.description,
      userId: dto.userId,
      totalValue: 0,
    });

    return await this.investmentPortfolioRepository.create(portfolio);
  }
}