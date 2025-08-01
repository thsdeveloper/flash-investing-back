import {
  UserFinanceSettingsRepository
} from "@src/modules/user-finance-settings/domain/contracts/user-finance-settings-repository";
import {
  UpdateUserFinanceSettingsDto, UserFinanceSettingsResponseDto
} from "@src/modules/user-finance-settings/application/dtos/user-finance-settings-dtos";

export class UpdateUserFinanceSettingsUseCase {
  constructor(private userFinanceSettingsRepository: UserFinanceSettingsRepository) {}

  async execute(id: string, userId: string, dto: UpdateUserFinanceSettingsDto): Promise<UserFinanceSettingsResponseDto> {
    const settings = await this.userFinanceSettingsRepository.findById(id)
    
    if (!settings) {
      throw new Error('Finance settings not found')
    }

    if (settings.userId !== userId) {
      throw new Error('Unauthorized')
    }

    settings.update(dto)

    const updatedSettings = await this.userFinanceSettingsRepository.update(settings)

    return {
      id: updatedSettings.id,
      salary: updatedSettings.salary,
      fixed: updatedSettings.fixed,
      variable: updatedSettings.variable,
      investments: updatedSettings.investments,
      userId: updatedSettings.userId,
      createdAt: updatedSettings.createdAt,
      updatedAt: updatedSettings.updatedAt
    }
  }
}