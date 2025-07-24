import { UserFinanceSettingsRepository } from '../../domain/contracts/user-finance-settings-repository'

export class DeleteUserFinanceSettingsUseCase {
  constructor(private userFinanceSettingsRepository: UserFinanceSettingsRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const settings = await this.userFinanceSettingsRepository.findById(id)
    
    if (!settings) {
      throw new Error('Finance settings not found')
    }

    if (settings.userId !== userId) {
      throw new Error('Unauthorized')
    }

    await this.userFinanceSettingsRepository.delete(id)
  }
}