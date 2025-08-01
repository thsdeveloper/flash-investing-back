import {UserFinanceSettings} from "@src/modules/user-finance-settings/domain/entities/user-finance-settings";
import {Transaction} from "@src/modules/transactions/domain/entities/transaction";
import {FinancialCategory} from "@src/modules/financial-categories/domain/entities/financial-category";

export interface BudgetCalculation {
  necessidades: {
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
  };
  desejos: {
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
  };
  futuro: {
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
  };
  total: {
    budget: number;
    spent: number;
    remaining: number;
  };
}

export interface CategoryBudgetValidation {
  isValid: boolean;
  message?: string;
  category: 'necessidades' | 'desejos' | 'futuro';
  available: number;
  requested: number;
}

export class BudgetService {
  /**
   * Calcula o orçamento atual baseado nas configurações do usuário e transações
   */
  static calculateBudget(
    userSettings: UserFinanceSettings,
    transactions: Transaction[],
    categories: FinancialCategory[] | any[],
    startDate: Date,
    endDate: Date
  ): BudgetCalculation {
    const budgets = userSettings.calculateBudgets();
    
    // Filtrar transações do período
    const periodTransactions = transactions.filter(
      t => t.getData() >= startDate && t.getData() <= endDate && t.isDespesa()
    );

    // Calcular gastos por categoria de regra
    const spentByRule = this.calculateSpentByRule(periodTransactions, categories);

    return {
      necessidades: {
        budget: budgets.fixed,
        spent: spentByRule.necessidades,
        remaining: budgets.fixed - spentByRule.necessidades,
        percentage: userSettings.fixed
      },
      desejos: {
        budget: budgets.variable,
        spent: spentByRule.desejos,
        remaining: budgets.variable - spentByRule.desejos,
        percentage: userSettings.variable
      },
      futuro: {
        budget: budgets.investments,
        spent: spentByRule.futuro,
        remaining: budgets.investments - spentByRule.futuro,
        percentage: userSettings.investments
      },
      total: {
        budget: budgets.total,
        spent: spentByRule.necessidades + spentByRule.desejos + spentByRule.futuro,
        remaining: budgets.total - (spentByRule.necessidades + spentByRule.desejos + spentByRule.futuro)
      }
    };
  }

  /**
   * Valida se uma nova transação pode ser criada sem exceder o orçamento
   */
  static validateTransactionBudget(
    transactionValue: number,
    categoryIdentifier: string,
    userSettings: UserFinanceSettings,
    transactions: Transaction[],
    categories: FinancialCategory[] | any[],
    startDate: Date,
    endDate: Date
  ): CategoryBudgetValidation {
    // Encontrar a categoria por ID ou nome (aceita tanto entidades quanto objetos simples)
    const category = categories.find(c => {
      const categoryId = c.getId ? c.getId() : c.id
      const categoryName = c.nome
      return categoryId === categoryIdentifier || categoryName === categoryIdentifier
    });
    if (!category || !category.ruleCategory) {
      return {
        isValid: true,
        category: 'necessidades', // default
        available: 0,
        requested: transactionValue
      };
    }

    const ruleCategory = category.ruleCategory;
    const currentBudget = this.calculateBudget(userSettings, transactions, categories, startDate, endDate);

    let available = 0;
    switch (ruleCategory) {
      case 'necessidades':
        available = currentBudget.necessidades.remaining;
        break;
      case 'desejos':
        available = currentBudget.desejos.remaining;
        break;
      case 'futuro':
        available = currentBudget.futuro.remaining;
        break;
    }

    const isValid = available >= transactionValue;

    return {
      isValid,
      message: isValid ? undefined : `Orçamento insuficiente para categoria ${ruleCategory}. Disponível: R$ ${available.toFixed(2)}, Solicitado: R$ ${transactionValue.toFixed(2)}`,
      category: ruleCategory,
      available,
      requested: transactionValue
    };
  }

  /**
   * Calcula o total gasto por categoria de regra (50/30/20)
   */
  private static calculateSpentByRule(
    transactions: Transaction[],
    categories: FinancialCategory[] | any[]
  ): { necessidades: number; desejos: number; futuro: number } {
    const spentByRule = {
      necessidades: 0,
      desejos: 0,
      futuro: 0
    };

    transactions.forEach(transaction => {
      const categoryName = transaction.getCategoria();
      const categoryId = transaction.getCategoriaId();
      
      if (!categoryName && !categoryId) return;

      // Buscar categoria por ID ou nome
      const category = categories.find(c => {
        const catId = c.getId ? c.getId() : c.id
        return (categoryId && catId === categoryId) || 
               (categoryName && c.nome === categoryName)
      });
      
      if (!category || !category.ruleCategory) return;

      const ruleCategory = category.ruleCategory;
      spentByRule[ruleCategory as keyof typeof spentByRule] += transaction.getValor();
    });

    return spentByRule;
  }

  /**
   * Obtém o período do mês atual
   */
  static getCurrentMonthPeriod(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    return { startDate, endDate };
  }

  /**
   * Verifica se o usuário tem configurações de orçamento definidas
   */
  static hasValidBudgetSettings(userSettings: UserFinanceSettings | null): boolean {
    return userSettings !== null && userSettings.salary > 0;
  }

  /**
   * Calcula a porcentagem de uso do orçamento
   */
  static calculateBudgetUsagePercentage(spent: number, budget: number): number {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  }

  /**
   * Determina o status do orçamento baseado na porcentagem de uso
   */
  static getBudgetStatus(usagePercentage: number): 'safe' | 'warning' | 'danger' {
    if (usagePercentage < 70) return 'safe';
    if (usagePercentage < 90) return 'warning';
    return 'danger';
  }
}