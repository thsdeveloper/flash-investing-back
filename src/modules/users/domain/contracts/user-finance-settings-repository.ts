import {UserFinanceSettings} from "@src/modules/user-finance-settings/domain/entities/user-finance-settings";

export interface UserFinanceSettingsRepository {
  create(settings: UserFinanceSettings): Promise<UserFinanceSettings>
  update(settings: UserFinanceSettings): Promise<UserFinanceSettings>
  findByUserId(userId: string): Promise<UserFinanceSettings | null>
  findById(id: string): Promise<UserFinanceSettings | null>
  delete(id: string): Promise<void>
}