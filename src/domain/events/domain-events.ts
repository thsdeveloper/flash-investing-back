/**
 * Sistema de eventos de domínio para manter consistência
 * e otimizar performance do módulo de finanças
 */

export interface DomainEvent {
  eventName: string
  occurredOn: Date
  eventData: any
}

export interface DomainEventHandler {
  handle(event: DomainEvent): Promise<void>
}

export class DomainEventDispatcher {
  private handlers: Map<string, DomainEventHandler[]> = new Map()
  private static instance: DomainEventDispatcher

  static getInstance(): DomainEventDispatcher {
    if (!DomainEventDispatcher.instance) {
      DomainEventDispatcher.instance = new DomainEventDispatcher()
    }
    return DomainEventDispatcher.instance
  }

  register(eventName: string, handler: DomainEventHandler): void {
    const handlers = this.handlers.get(eventName) || []
    handlers.push(handler)
    this.handlers.set(eventName, handlers)
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) || []
    
    for (const handler of handlers) {
      try {
        await handler.handle(event)
      } catch (error) {
        console.error(`Error handling event ${event.eventName}:`, error)
      }
    }
  }
}

// Eventos específicos do domínio de finanças
export class TransactionCreatedEvent implements DomainEvent {
  eventName = 'TransactionCreated'
  occurredOn = new Date()

  constructor(
    public eventData: {
      transactionId: string
      userId: string
      accountId: string
      categoryName: string
      amount: number
      type: 'receita' | 'despesa' | 'transferencia'
      date: Date
    }
  ) {}
}

export class BudgetExceededEvent implements DomainEvent {
  eventName = 'BudgetExceeded'
  occurredOn = new Date()

  constructor(
    public eventData: {
      userId: string
      categoryType: 'necessidades' | 'desejos' | 'futuro'
      budgetAmount: number
      currentSpent: number
      percentage: number
      transactionId?: string
    }
  ) {}
}

export class AccountBalanceUpdatedEvent implements DomainEvent {
  eventName = 'AccountBalanceUpdated'
  occurredOn = new Date()

  constructor(
    public eventData: {
      accountId: string
      userId: string
      previousBalance: number
      newBalance: number
      transactionId?: string
    }
  ) {}
}

export class CategoryCreatedEvent implements DomainEvent {
  eventName = 'CategoryCreated'
  occurredOn = new Date()

  constructor(
    public eventData: {
      categoryId: string
      userId: string
      categoryName: string
      ruleCategory: 'necessidades' | 'desejos' | 'futuro' | null
      type: 'receita' | 'despesa'
    }
  ) {}
}

export class UserBudgetConfiguredEvent implements DomainEvent {
  eventName = 'UserBudgetConfigured'
  occurredOn = new Date()

  constructor(
    public eventData: {
      userId: string
      salary: number
      necessidadesPercentage: number
      desejosPercentage: number
      investimentosPercentage: number
      budgetAmounts: {
        necessidades: number
        desejos: number
        investimentos: number
      }
    }
  ) {}
}

// Handlers para os eventos
export class UpdateAccountBalanceHandler implements DomainEventHandler {
  constructor(private prisma: any) {}

  async handle(event: TransactionCreatedEvent): Promise<void> {
    const { accountId, amount, type } = event.eventData

    if (type === 'receita') {
      await this.prisma.financialAccount.update({
        where: { id: accountId },
        data: { 
          saldoAtual: { increment: amount },
          updatedAt: new Date()
        }
      })
    } else if (type === 'despesa') {
      await this.prisma.financialAccount.update({
        where: { id: accountId },
        data: { 
          saldoAtual: { decrement: amount },
          updatedAt: new Date()
        }
      })
    }
  }
}

export class CreateDefaultCategoriesHandler implements DomainEventHandler {
  constructor(private prisma: any) {}

  async handle(event: UserBudgetConfiguredEvent): Promise<void> {
    const { userId } = event.eventData

    // Verificar se já tem categorias padrão
    const existingCategories = await this.prisma.financialCategory.count({
      where: { userId }
    })

    if (existingCategories > 0) return

    // Criar categorias padrão
    const defaultCategories = [
      // Necessidades
      { nome: 'Alimentação', tipo: 'despesa', ruleCategory: 'necessidades', icone: '🍽️' },
      { nome: 'Moradia', tipo: 'despesa', ruleCategory: 'necessidades', icone: '🏠' },
      { nome: 'Transporte', tipo: 'despesa', ruleCategory: 'necessidades', icone: '🚗' },
      { nome: 'Saúde', tipo: 'despesa', ruleCategory: 'necessidades', icone: '⚕️' },
      { nome: 'Educação', tipo: 'despesa', ruleCategory: 'necessidades', icone: '📚' },
      
      // Desejos
      { nome: 'Lazer', tipo: 'despesa', ruleCategory: 'desejos', icone: '🎮' },
      { nome: 'Restaurantes', tipo: 'despesa', ruleCategory: 'desejos', icone: '🍽️' },
      { nome: 'Compras', tipo: 'despesa', ruleCategory: 'desejos', icone: '🛍️' },
      { nome: 'Assinaturas', tipo: 'despesa', ruleCategory: 'desejos', icone: '📱' },
      
      // Investimentos
      { nome: 'Poupança', tipo: 'despesa', ruleCategory: 'futuro', icone: '💰' },
      { nome: 'Investimentos', tipo: 'despesa', ruleCategory: 'futuro', icone: '📈' },
      { nome: 'Emergência', tipo: 'despesa', ruleCategory: 'futuro', icone: '🚨' },
      
      // Receitas
      { nome: 'Salário', tipo: 'receita', ruleCategory: null, icone: '💵' },
      { nome: 'Freelance', tipo: 'receita', ruleCategory: null, icone: '💼' },
      { nome: 'Rendimentos', tipo: 'receita', ruleCategory: null, icone: '📊' },
      
      // Outros
      { nome: 'Outros', tipo: 'despesa', ruleCategory: 'desejos', icone: '❓' },
      { nome: 'Transferência', tipo: 'despesa', ruleCategory: null, icone: '↔️' }
    ]

    for (const category of defaultCategories) {
      await this.prisma.financialCategory.create({
        data: {
          ...category,
          userId,
          cor: this.getRandomColor(),
          ativa: true,
          status: 'published',
          sort: 0
        }
      })
    }
  }

  private getRandomColor(): string {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }
}

export class BudgetTrackingHandler implements DomainEventHandler {
  constructor(private prisma: any) {}

  async handle(event: TransactionCreatedEvent): Promise<void> {
    const { userId, categoryName, amount, type } = event.eventData

    if (type !== 'despesa') return

    // Buscar categoria para verificar rule_category
    const category = await this.prisma.financialCategory.findFirst({
      where: { userId, nome: categoryName }
    })

    if (!category || !category.ruleCategory) return

    // Buscar configurações do usuário
    const userSettings = await this.prisma.userFinanceSettings.findFirst({
      where: { userId }
    })

    if (!userSettings) return

    // Calcular orçamento da categoria
    const monthlyBudget = userSettings.salary
    let categoryBudget = 0
    
    switch (category.ruleCategory) {
      case 'necessidades':
        categoryBudget = (monthlyBudget * userSettings.fixed) / 100
        break
      case 'desejos':
        categoryBudget = (monthlyBudget * userSettings.variable) / 100
        break
      case 'futuro':
        categoryBudget = (monthlyBudget * userSettings.investments) / 100
        break
    }

    // Calcular gastos do mês na categoria
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const monthlySpent = await this.prisma.transaction.aggregate({
      where: {
        userId,
        categoria: categoryName,
        tipo: 'despesa',
        data: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: { valor: true }
    })

    const totalSpent = (monthlySpent._sum.valor || 0)
    const percentage = (totalSpent / categoryBudget) * 100

    // Disparar evento se passou de 100%
    if (percentage > 100) {
      const budgetExceededEvent = new BudgetExceededEvent({
        userId,
        categoryType: category.ruleCategory,
        budgetAmount: categoryBudget,
        currentSpent: totalSpent,
        percentage,
        transactionId: event.eventData.transactionId
      })

      await DomainEventDispatcher.getInstance().dispatch(budgetExceededEvent)
    }
  }
}

// Inicializar handlers
export function initializeDomainEventHandlers(prisma: any): void {
  const dispatcher = DomainEventDispatcher.getInstance()

  // Registrar handlers
  dispatcher.register('TransactionCreated', new UpdateAccountBalanceHandler(prisma))
  dispatcher.register('TransactionCreated', new BudgetTrackingHandler(prisma))
  dispatcher.register('UserBudgetConfigured', new CreateDefaultCategoriesHandler(prisma))
}