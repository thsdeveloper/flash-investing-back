import {InvestmentPortfolio} from "@src/modules/investments/domain/entities/investment-portfolio";

export interface InvestmentPortfolioRepository {
  create(portfolio: InvestmentPortfolio): Promise<InvestmentPortfolio>;
  findById(id: string): Promise<InvestmentPortfolio | null>;
  findByUserId(userId: string): Promise<InvestmentPortfolio[]>;
  update(portfolio: InvestmentPortfolio): Promise<InvestmentPortfolio>;
  delete(id: string): Promise<void>;
}