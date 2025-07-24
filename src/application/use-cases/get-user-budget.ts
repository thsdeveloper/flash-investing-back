import { TransactionRepository } from '../../domain/contracts/transaction-repository';
import { FinancialCategoryRepository } from '../../domain/contracts/financial-category-repository';
import { UserFinanceSettingsRepository } from '../../domain/contracts/user-finance-settings-repository';
import { BudgetService, BudgetCalculation } from '../../domain/services/budget-service';

export interface GetUserBudgetDto {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface BudgetResponseDto {
  period: {
    startDate: string;
    endDate: string;
  };
  budget: BudgetCalculation;
  hasValidSettings: boolean;
  message?: string;
}

export class GetUserBudgetUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly financialCategoryRepository: FinancialCategoryRepository,
    private readonly userFinanceSettingsRepository: UserFinanceSettingsRepository
  ) {}

  async execute(dto: GetUserBudgetDto): Promise<BudgetResponseDto> {
    // Definir período (padrão: mês atual)
    const { startDate, endDate } = dto.startDate && dto.endDate 
      ? { startDate: dto.startDate, endDate: dto.endDate }
      : BudgetService.getCurrentMonthPeriod();

    // Buscar configurações do usuário
    const userSettings = await this.userFinanceSettingsRepository.findByUserId(dto.userId);
    
    if (!BudgetService.hasValidBudgetSettings(userSettings)) {
      return {
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        budget: {
          necessidades: { budget: 0, spent: 0, remaining: 0, percentage: 0 },
          desejos: { budget: 0, spent: 0, remaining: 0, percentage: 0 },
          futuro: { budget: 0, spent: 0, remaining: 0, percentage: 0 },
          total: { budget: 0, spent: 0, remaining: 0 }
        },
        hasValidSettings: false,
        message: 'Usuário não possui configurações de orçamento válidas. Configure sua renda e percentuais para usar esta funcionalidade.'
      };
    }

    // Buscar categorias do usuário
    const categories = await this.financialCategoryRepository.findByUser(dto.userId);
    
    // Buscar transações do período
    const transactions = await this.transactionRepository.findByUserIdAndDateRange(
      dto.userId, 
      startDate, 
      endDate
    );

    // Calcular orçamento
    const budget = BudgetService.calculateBudget(
      userSettings!,
      transactions,
      categories,
      startDate,
      endDate
    );

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      budget,
      hasValidSettings: true
    };
  }
}