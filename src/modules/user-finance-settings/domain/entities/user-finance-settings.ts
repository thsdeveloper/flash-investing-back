export interface UserFinanceSettingsProps {
  id: string
  salary: number
  fixed: number
  variable: number
  investments: number
  userId: string
  createdAt: Date
  updatedAt: Date
}

export class UserFinanceSettings {
  private constructor(private props: UserFinanceSettingsProps) {}

  get id(): string {
    return this.props.id
  }

  get salary(): number {
    return this.props.salary
  }

  get fixed(): number {
    return this.props.fixed
  }

  get variable(): number {
    return this.props.variable
  }

  get investments(): number {
    return this.props.investments
  }

  get userId(): string {
    return this.props.userId
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  static create(props: UserFinanceSettingsProps): UserFinanceSettings {
    const totalPercentage = props.fixed + props.variable + props.investments
    
    if (totalPercentage !== 100) {
      throw new Error('The sum of percentages must equal 100')
    }

    if (props.salary <= 0) {
      throw new Error('Salary must be positive')
    }

    if (props.fixed < 0 || props.variable < 0 || props.investments < 0) {
      throw new Error('Percentages must be positive')
    }

    // Regras específicas da metodologia 50-30-20
    if (props.fixed < 40 || props.fixed > 60) {
      throw new Error('Necessidades (fixed) deve estar entre 40% e 60%')
    }

    if (props.investments < 10 || props.investments > 30) {
      throw new Error('Investimentos (investments) deve estar entre 10% e 30%')
    }

    // Desejos (variable) é o que resta, mas vamos validar se faz sentido
    if (props.variable < 10 || props.variable > 50) {
      throw new Error('Desejos (variable) deve estar entre 10% e 50%')
    }

    return new UserFinanceSettings(props)
  }

  public calculateBudgets() {
    const monthlyBudget = this.props.salary
    
    return {
      fixed: (monthlyBudget * this.props.fixed) / 100,
      variable: (monthlyBudget * this.props.variable) / 100,
      investments: (monthlyBudget * this.props.investments) / 100,
      total: monthlyBudget
    }
  }

  public update(updates: Partial<Pick<UserFinanceSettingsProps, 'salary' | 'fixed' | 'variable' | 'investments'>>): void {
    if (updates.salary !== undefined) {
      if (updates.salary < 0) {
        throw new Error('Salary must be positive')
      }
      this.props.salary = updates.salary
    }

    if (updates.fixed !== undefined || updates.variable !== undefined || updates.investments !== undefined) {
      const newFixed = updates.fixed ?? this.props.fixed
      const newVariable = updates.variable ?? this.props.variable
      const newInvestments = updates.investments ?? this.props.investments

      const totalPercentage = newFixed + newVariable + newInvestments
      
      if (totalPercentage !== 100) {
        throw new Error('The sum of percentages must equal 100')
      }

      if (newFixed < 0 || newVariable < 0 || newInvestments < 0) {
        throw new Error('Percentages must be positive')
      }

      this.props.fixed = newFixed
      this.props.variable = newVariable
      this.props.investments = newInvestments
    }

    this.props.updatedAt = new Date()
  }
}