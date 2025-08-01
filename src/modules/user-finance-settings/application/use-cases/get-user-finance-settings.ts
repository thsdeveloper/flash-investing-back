import {
  UserFinanceSettingsBudgetDto,
  UserFinanceSettingsResponseDto
} from "@src/modules/user-finance-settings/application/dtos/user-finance-settings-dtos";
import {
  UserFinanceSettingsRepository
} from "@src/modules/user-finance-settings/domain/contracts/user-finance-settings-repository";

export interface GetUserFinanceSettingsResponseDto extends UserFinanceSettingsResponseDto {
  budgets: UserFinanceSettingsBudgetDto
}

export class GetUserFinanceSettingsUseCase {
  constructor(private userFinanceSettingsRepository: UserFinanceSettingsRepository) {}

  async execute(userId: string): Promise<GetUserFinanceSettingsResponseDto | null> {
    const settings = await this.userFinanceSettingsRepository.findByUserId(userId)
    
    if (!settings) {
      return null
    }

    const budgets = settings.calculateBudgets()

    return {
      id: settings.id,
      salary: settings.salary,
      fixed: settings.fixed,
      variable: settings.variable,
      investments: settings.investments,
      userId: settings.userId,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
      budgets
    }
  }
}