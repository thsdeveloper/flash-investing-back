import { randomUUID } from 'crypto';
import { UserFinanceSettings } from '../../domain/entities/user-finance-settings'
import { UserFinanceSettingsRepository } from '../../domain/contracts/user-finance-settings-repository'
import { CreateUserFinanceSettingsDto, UserFinanceSettingsResponseDto } from '../dtos/user-finance-settings-dtos'

export class CreateUserFinanceSettingsUseCase {
  constructor(private userFinanceSettingsRepository: UserFinanceSettingsRepository) {}

  async execute(dto: CreateUserFinanceSettingsDto): Promise<UserFinanceSettingsResponseDto> {
    const existingSettings = await this.userFinanceSettingsRepository.findByUserId(dto.userId)
    
    if (existingSettings) {
      throw new Error('User already has finance settings')
    }

    const settings = UserFinanceSettings.create({
      id: randomUUID(),
      salary: dto.salary,
      fixed: dto.fixed,
      variable: dto.variable,
      investments: dto.investments,
      userId: dto.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const savedSettings = await this.userFinanceSettingsRepository.create(settings)

    return {
      id: savedSettings.id,
      salary: savedSettings.salary,
      fixed: savedSettings.fixed,
      variable: savedSettings.variable,
      investments: savedSettings.investments,
      userId: savedSettings.userId,
      createdAt: savedSettings.createdAt,
      updatedAt: savedSettings.updatedAt
    }
  }
}