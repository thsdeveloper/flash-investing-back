export interface CreateUserFinanceSettingsDto {
  salary: number
  fixed: number
  variable: number
  investments: number
  userId: string
}

export interface UpdateUserFinanceSettingsDto {
  salary?: number
  fixed?: number
  variable?: number
  investments?: number
}

export interface UserFinanceSettingsResponseDto {
  id: string
  salary: number
  fixed: number
  variable: number
  investments: number
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface UserFinanceSettingsBudgetDto {
  fixed: number
  variable: number
  investments: number
  total: number
}