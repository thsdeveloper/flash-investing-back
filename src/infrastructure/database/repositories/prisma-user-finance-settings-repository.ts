import { PrismaClient } from '@prisma/client'
import { UserFinanceSettings } from '../../../domain/entities/user-finance-settings'
import { UserFinanceSettingsRepository } from '../../../domain/contracts/user-finance-settings-repository'

export class PrismaUserFinanceSettingsRepository implements UserFinanceSettingsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(settings: UserFinanceSettings): Promise<UserFinanceSettings> {
    const data = await this.prisma.userFinanceSettings.create({
      data: {
        salary: settings.salary,
        fixed: settings.fixed,
        variable: settings.variable,
        investments: settings.investments,
        userId: settings.userId
      }
    })

    return UserFinanceSettings.create({
      id: data.id,
      salary: data.salary.toNumber(),
      fixed: data.fixed,
      variable: data.variable,
      investments: data.investments,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    })
  }

  async update(settings: UserFinanceSettings): Promise<UserFinanceSettings> {
    const data = await this.prisma.userFinanceSettings.update({
      where: { id: settings.id },
      data: {
        salary: settings.salary,
        fixed: settings.fixed,
        variable: settings.variable,
        investments: settings.investments
      }
    })

    return UserFinanceSettings.create({
      id: data.id,
      salary: data.salary.toNumber(),
      fixed: data.fixed,
      variable: data.variable,
      investments: data.investments,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    })
  }

  async findByUserId(userId: string): Promise<UserFinanceSettings | null> {
    const data = await this.prisma.userFinanceSettings.findUnique({
      where: { userId }
    })

    if (!data) {
      return null
    }

    return UserFinanceSettings.create({
      id: data.id,
      salary: data.salary.toNumber(),
      fixed: data.fixed,
      variable: data.variable,
      investments: data.investments,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    })
  }

  async findById(id: string): Promise<UserFinanceSettings | null> {
    const data = await this.prisma.userFinanceSettings.findUnique({
      where: { id }
    })

    if (!data) {
      return null
    }

    return UserFinanceSettings.create({
      id: data.id,
      salary: data.salary.toNumber(),
      fixed: data.fixed,
      variable: data.variable,
      investments: data.investments,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userFinanceSettings.delete({
      where: { id }
    })
  }
}