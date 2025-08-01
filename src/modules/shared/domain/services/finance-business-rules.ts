import {FinancialAccount} from "@src/modules/financial-accounts/domain/entities/financial-account";
import {FinancialCategory} from "@src/modules/financial-categories/domain/entities/financial-category";
import {UserFinanceSettings} from "@src/modules/user-finance-settings/domain/entities/user-finance-settings";

export class FinanceBusinessRules {
  /**
   * Valida se o usuário pode criar uma categoria
   * Regra: Usuário deve ter orçamento configurado
   */
  static validateCategoryCreation(
    userFinanceSettings: UserFinanceSettings | null,
    categoryType: 'necessidades' | 'desejos' | 'futuro'
  ): void {
    if (!userFinanceSettings) {
      throw new Error('Para criar categorias, primeiro configure seu orçamento mensal')
    }

    // Validar se o tipo da categoria é compatível com o orçamento
    const budgets = userFinanceSettings.calculateBudgets()
    
    if (categoryType === 'necessidades' && budgets.fixed <= 0) {
      throw new Error('Orçamento para necessidades deve ser maior que zero')
    }
    
    if (categoryType === 'desejos' && budgets.variable <= 0) {
      throw new Error('Orçamento para desejos deve ser maior que zero')
    }
    
    if (categoryType === 'futuro' && budgets.investments <= 0) {
      throw new Error('Orçamento para investimentos deve ser maior que zero')
    }
  }

  /**
   * Valida se o usuário pode criar uma transação
   * Regra: Deve ter conta e categoria
   */
  static validateTransactionCreation(
    account: FinancialAccount | null,
    category: FinancialCategory | null,
    valor: number,
    tipo: 'receita' | 'despesa' | 'transferencia'
  ): void {
    if (!account) {
      throw new Error('Transação deve estar vinculada a uma conta. Crie uma conta primeiro.')
    }

    if (!category) {
      throw new Error('Transação deve ter uma categoria. Crie uma categoria primeiro.')
    }

    if (valor <= 0) {
      throw new Error('Valor da transação deve ser maior que zero')
    }

    // Validar se a categoria está ativa
    if (!category.isActive()) {
      throw new Error('Não é possível criar transação com categoria inativa')
    }

    // Validar saldo disponível para despesas
    if (tipo === 'despesa' && !account.hasAvailableBalance(valor)) {
      throw new Error('Saldo insuficiente na conta para esta transação')
    }
  }

  /**
   * Valida se o usuário pode criar uma compra no cartão
   * Regra: Deve ter limite disponível
   */
  static validateCreditCardTransaction(
    creditCard: any, // Vou definir a interface depois
    valor: number,
    parcelas: number = 1
  ): void {
    if (!creditCard) {
      throw new Error('Cartão de crédito não encontrado')
    }

    if (valor <= 0) {
      throw new Error('Valor da compra deve ser maior que zero')
    }

    if (parcelas < 1 || parcelas > 12) {
      throw new Error('Número de parcelas deve estar entre 1 e 12')
    }

    const limiteDisponivel = creditCard.limite - creditCard.saldoUtilizado
    if (valor > limiteDisponivel) {
      throw new Error(`Limite insuficiente. Disponível: R$ ${limiteDisponivel.toFixed(2)}`)
    }
  }

  /**
   * Valida se uma categoria pode ser excluída
   * Regra: Não pode ter transações associadas
   */
  static validateCategoryDeletion(
    category: FinancialCategory,
    hasTransactions: boolean
  ): void {
    if (hasTransactions) {
      throw new Error('Não é possível excluir categoria que possui transações associadas')
    }

    // Não permitir exclusão de categorias padrão
    if (category.isDefault()) {
      throw new Error('Não é possível excluir categoria padrão')
    }
  }

  /**
   * Valida se uma conta pode ser excluída
   * Regra: Não pode ter transações ou cartões associados
   */
  static validateAccountDeletion(
    account: FinancialAccount,
    hasTransactions: boolean,
    hasCreditCards: boolean
  ): void {
    if (hasTransactions) {
      throw new Error('Não é possível excluir conta que possui transações associadas')
    }

    if (hasCreditCards) {
      throw new Error('Não é possível excluir conta que possui cartões de crédito associados')
    }
  }

  /**
   * Valida se o orçamento está sendo respeitado
   * Regra: Gastos não podem exceder 110% do orçamento da categoria
   */
  static validateBudgetCompliance(
    userFinanceSettings: UserFinanceSettings,
    categoryType: 'necessidades' | 'desejos' | 'futuro',
    currentSpent: number,
    newTransactionValue: number
  ): { isValid: boolean; message: string; percentage: number } {
    const budgets = userFinanceSettings.calculateBudgets()
    
    let categoryBudget: number
    let categoryName: string
    
    switch (categoryType) {
      case 'necessidades':
        categoryBudget = budgets.fixed
        categoryName = 'Necessidades'
        break
      case 'desejos':
        categoryBudget = budgets.variable
        categoryName = 'Desejos'
        break
      case 'futuro':
        categoryBudget = budgets.investments
        categoryName = 'Investimentos'
        break
      default:
        throw new Error('Tipo de categoria inválido')
    }

    const totalSpent = currentSpent + newTransactionValue
    const percentage = (totalSpent / categoryBudget) * 100
    
    // Permitir até 110% do orçamento (margem de 10%)
    const maxAllowed = categoryBudget * 1.1
    
    if (totalSpent > maxAllowed) {
      return {
        isValid: false,
        message: `Esta transação excederia o limite máximo de ${categoryName} (110% do orçamento)`,
        percentage
      }
    }

    // Avisos para diferentes níveis
    if (percentage > 100) {
      return {
        isValid: true,
        message: `Atenção: Esta transação excederá o orçamento de ${categoryName} (${percentage.toFixed(1)}%)`,
        percentage
      }
    }

    if (percentage > 80) {
      return {
        isValid: true,
        message: `Aviso: Você está usando ${percentage.toFixed(1)}% do orçamento de ${categoryName}`,
        percentage
      }
    }

    return {
      isValid: true,
      message: `Transação dentro do orçamento de ${categoryName} (${percentage.toFixed(1)}%)`,
      percentage
    }
  }

  /**
   * Calcula o impacto de uma transação no orçamento
   */
  static calculateBudgetImpact(
    userFinanceSettings: UserFinanceSettings,
    categoryType: 'necessidades' | 'desejos' | 'futuro',
    valor: number
  ): { budget: number; impact: number; percentage: number } {
    const budgets = userFinanceSettings.calculateBudgets()
    
    let categoryBudget: number
    switch (categoryType) {
      case 'necessidades':
        categoryBudget = budgets.fixed
        break
      case 'desejos':
        categoryBudget = budgets.variable
        break
      case 'futuro':
        categoryBudget = budgets.investments
        break
      default:
        throw new Error('Tipo de categoria inválido')
    }

    const percentage = (valor / categoryBudget) * 100
    
    return {
      budget: categoryBudget,
      impact: valor,
      percentage
    }
  }
}