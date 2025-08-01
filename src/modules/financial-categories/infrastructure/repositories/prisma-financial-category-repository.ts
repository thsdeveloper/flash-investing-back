import { PrismaClient } from '@prisma/client'
import { FinancialCategory } from '@src/modules/financial-categories/domain/entities/financial-category'
import { 
  FinancialCategoryRepository, 
  FinancialCategoryListOptions, 
  FinancialCategoryFilters, 
  FinancialCategoryStats 
} from '@src/modules/financial-categories/domain/contracts/financial-category-repository'

export class PrismaFinancialCategoryRepository implements FinancialCategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(category: FinancialCategory): Promise<FinancialCategory> {
    const data = await this.prisma.financialCategory.create({
      data: {
        nome: category.nome,
        descricao: category.descricao,
        icone: category.icone,
        cor: category.cor,
        tipo: category.tipo,
        ativa: category.ativa,
        ruleCategory: category.ruleCategory,
        sort: category.sort,
        status: category.status,
        userId: category.userId
      }
    })

    return this.mapToEntity(data)
  }

  async update(category: FinancialCategory): Promise<FinancialCategory> {
    const data = await this.prisma.financialCategory.update({
      where: { id: category.id },
      data: {
        nome: category.nome,
        descricao: category.descricao,
        icone: category.icone,
        cor: category.cor,
        ativa: category.ativa,
        ruleCategory: category.ruleCategory,
        sort: category.sort,
        status: category.status
      }
    })

    return this.mapToEntity(data)
  }

  async findById(id: string): Promise<FinancialCategory | null> {
    const data = await this.prisma.financialCategory.findUnique({
      where: { id }
    })

    return data ? this.mapToEntity(data) : null
  }

  async findByName(userId: string, nome: string): Promise<FinancialCategory | null> {
    const data = await this.prisma.financialCategory.findUnique({
      where: { 
        userId_nome: { 
          userId, 
          nome 
        } 
      }
    })

    return data ? this.mapToEntity(data) : null
  }

  async findByUser(userId: string): Promise<FinancialCategory[]> {
    const data = await this.prisma.financialCategory.findMany({
      where: { userId },
      orderBy: [
        { sort: 'asc' },
        { nome: 'asc' }
      ]
    })

    return data.map(this.mapToEntity)
  }

  async findMany(options: FinancialCategoryListOptions): Promise<FinancialCategory[]> {
    const where = this.buildWhereClause(options)
    const orderBy = this.buildOrderBy(options)

    const data = await this.prisma.financialCategory.findMany({
      where,
      orderBy,
      take: options.limit,
      skip: options.offset
    })

    return data.map(this.mapToEntity)
  }

  async countByFilters(filters: FinancialCategoryFilters): Promise<number> {
    const where = this.buildWhereClause(filters)
    
    return await this.prisma.financialCategory.count({
      where
    })
  }

  async getStats(userId: string): Promise<FinancialCategoryStats> {
    const [
      totalCategories,
      activeCategories,
      receitaCategories,
      despesaCategories,
      necessidadesCategories,
      desejosCategories,
      futuroCategories,
      unclassifiedCategories
    ] = await Promise.all([
      this.prisma.financialCategory.count({
        where: { userId }
      }),
      this.prisma.financialCategory.count({
        where: { userId, ativa: true }
      }),
      this.prisma.financialCategory.count({
        where: { userId, tipo: 'receita' }
      }),
      this.prisma.financialCategory.count({
        where: { userId, tipo: 'despesa' }
      }),
      this.prisma.financialCategory.count({
        where: { userId, ruleCategory: 'necessidades' }
      }),
      this.prisma.financialCategory.count({
        where: { userId, ruleCategory: 'desejos' }
      }),
      this.prisma.financialCategory.count({
        where: { userId, ruleCategory: 'futuro' }
      }),
      this.prisma.financialCategory.count({
        where: { userId, ruleCategory: null }
      })
    ])

    return {
      totalCategories,
      activeCategories,
      receitaCategories,
      despesaCategories,
      categoriesByRule: {
        necessidades: necessidadesCategories,
        desejos: desejosCategories,
        futuro: futuroCategories,
        unclassified: unclassifiedCategories
      }
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.financialCategory.delete({
      where: { id }
    })
  }

  async bulkUpdate(categoryIds: string[], updates: Partial<FinancialCategory>): Promise<void> {
    const updateData: any = {}
    
    if (updates.ativa !== undefined) updateData.ativa = updates.ativa
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.ruleCategory !== undefined) updateData.ruleCategory = updates.ruleCategory
    if (updates.sort !== undefined) updateData.sort = updates.sort

    await this.prisma.financialCategory.updateMany({
      where: { id: { in: categoryIds } },
      data: updateData
    })
  }

  async reorder(categoryUpdates: Array<{ id: string; sort: number }>): Promise<void> {
    await this.prisma.$transaction(
      categoryUpdates.map(update => 
        this.prisma.financialCategory.update({
          where: { id: update.id },
          data: { sort: update.sort }
        })
      )
    )
  }

  async checkNameUniqueness(userId: string, nome: string, excludeId?: string): Promise<boolean> {
    const where: any = {
      userId,
      nome
    }

    if (excludeId) {
      where.id = { not: excludeId }
    }

    const existingCategory = await this.prisma.financialCategory.findFirst({
      where
    })

    return !existingCategory
  }

  private buildWhereClause(options: FinancialCategoryFilters): any {
    const where: any = {
      userId: options.userId
    }

    if (options.tipo) {
      where.tipo = options.tipo
    }

    if (options.ativa !== undefined) {
      where.ativa = options.ativa
    }

    if (options.status) {
      where.status = options.status
    }

    if (options.ruleCategory !== undefined) {
      where.ruleCategory = options.ruleCategory
    }

    if (options.search) {
      where.OR = [
        { nome: { contains: options.search, mode: 'insensitive' } },
        { descricao: { contains: options.search, mode: 'insensitive' } }
      ]
    }

    return where
  }

  private buildOrderBy(options: FinancialCategoryListOptions): any {
    const sortBy = options.sortBy || 'sort'
    const sortOrder = options.sortOrder || 'asc'

    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    if (sortBy !== 'nome') {
      return [orderBy, { nome: 'asc' }]
    }

    return orderBy
  }

  private mapToEntity(data: any): FinancialCategory {
    return FinancialCategory.create({
      id: data.id,
      nome: data.nome,
      descricao: data.descricao,
      icone: data.icone,
      cor: data.cor,
      tipo: data.tipo,
      ativa: data.ativa,
      ruleCategory: data.ruleCategory,
      sort: data.sort || 0,
      status: data.status,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    })
  }
}