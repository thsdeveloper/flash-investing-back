export interface FinancialCategoryProps {
  id: string
  nome: string
  descricao?: string
  icone?: string
  cor?: string
  tipo: 'receita' | 'despesa'
  ativa: boolean
  ruleCategory?: 'necessidades' | 'desejos' | 'futuro' | null
  sort: number
  status: 'published' | 'draft' | 'archived'
  userId: string
  createdAt: Date
  updatedAt: Date
}

export class FinancialCategory {
  private constructor(private props: FinancialCategoryProps) {}

  get id(): string {
    return this.props.id
  }

  get nome(): string {
    return this.props.nome
  }

  get descricao(): string | undefined {
    return this.props.descricao
  }

  get icone(): string | undefined {
    return this.props.icone
  }

  get cor(): string | undefined {
    return this.props.cor
  }

  get tipo(): 'receita' | 'despesa' {
    return this.props.tipo
  }

  get ativa(): boolean {
    return this.props.ativa
  }

  get ruleCategory(): 'necessidades' | 'desejos' | 'futuro' | null | undefined {
    return this.props.ruleCategory
  }

  get sort(): number {
    return this.props.sort
  }

  get status(): 'published' | 'draft' | 'archived' {
    return this.props.status
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

  static create(props: FinancialCategoryProps): FinancialCategory {
    if (!props.nome || props.nome.trim().length === 0) {
      throw new Error('Category name is required')
    }

    if (props.nome.length > 100) {
      throw new Error('Category name must be less than 100 characters')
    }

    if (props.descricao && props.descricao.length > 500) {
      throw new Error('Category description must be less than 500 characters')
    }

    if (props.cor && !this.isValidHexColor(props.cor)) {
      throw new Error('Invalid color format. Use hex color format (#RRGGBB)')
    }

    if (!['receita', 'despesa'].includes(props.tipo)) {
      throw new Error('Invalid category type. Must be "receita" or "despesa"')
    }

    if (props.ruleCategory && !['necessidades', 'desejos', 'futuro'].includes(props.ruleCategory)) {
      throw new Error('Invalid rule category. Must be "necessidades", "desejos", or "futuro"')
    }

    if (!['published', 'draft', 'archived'].includes(props.status)) {
      throw new Error('Invalid status. Must be "published", "draft", or "archived"')
    }

    return new FinancialCategory(props)
  }

  private static isValidHexColor(color: string): boolean {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    return hexColorRegex.test(color)
  }

  public activate(): void {
    this.props.ativa = true
    this.props.updatedAt = new Date()
  }

  public deactivate(): void {
    this.props.ativa = false
    this.props.updatedAt = new Date()
  }

  public archive(): void {
    this.props.status = 'archived'
    this.props.ativa = false
    this.props.updatedAt = new Date()
  }

  public publish(): void {
    this.props.status = 'published'
    this.props.updatedAt = new Date()
  }

  public update(updates: Partial<Pick<FinancialCategoryProps, 'nome' | 'descricao' | 'icone' | 'cor' | 'ativa' | 'ruleCategory' | 'sort' | 'status'>>): void {
    if (updates.nome !== undefined) {
      if (!updates.nome || updates.nome.trim().length === 0) {
        throw new Error('Category name is required')
      }
      if (updates.nome.length > 100) {
        throw new Error('Category name must be less than 100 characters')
      }
      this.props.nome = updates.nome.trim()
    }

    if (updates.descricao !== undefined) {
      if (updates.descricao && updates.descricao.length > 500) {
        throw new Error('Category description must be less than 500 characters')
      }
      this.props.descricao = updates.descricao
    }

    if (updates.cor !== undefined) {
      if (updates.cor && !FinancialCategory.isValidHexColor(updates.cor)) {
        throw new Error('Invalid color format. Use hex color format (#RRGGBB)')
      }
      this.props.cor = updates.cor
    }

    if (updates.icone !== undefined) {
      this.props.icone = updates.icone
    }

    if (updates.ativa !== undefined) {
      this.props.ativa = updates.ativa
    }

    if (updates.ruleCategory !== undefined) {
      if (updates.ruleCategory && !['necessidades', 'desejos', 'futuro'].includes(updates.ruleCategory)) {
        throw new Error('Invalid rule category. Must be "necessidades", "desejos", or "futuro"')
      }
      this.props.ruleCategory = updates.ruleCategory
    }

    if (updates.sort !== undefined) {
      this.props.sort = updates.sort
    }

    if (updates.status !== undefined) {
      if (!['published', 'draft', 'archived'].includes(updates.status)) {
        throw new Error('Invalid status. Must be "published", "draft", or "archived"')
      }
      this.props.status = updates.status
    }

    this.props.updatedAt = new Date()
  }

  public belongsToUser(userId: string): boolean {
    return this.props.userId === userId
  }

  /**
   * Verifica se a categoria está ativa
   */
  public isActive(): boolean {
    return this.props.ativa && this.props.status === 'published'
  }

  /**
   * Verifica se é uma categoria padrão (não pode ser excluída)
   */
  public isDefault(): boolean {
    const defaultCategories = ['Outros', 'Transferência', 'Ajuste']
    return defaultCategories.includes(this.props.nome)
  }

  /**
   * Verifica se a categoria pode ser usada para transações
   */
  public canBeUsedForTransaction(): boolean {
    return this.isActive()
  }

  /**
   * Valida se a categoria tem uma regra de orçamento definida
   */
  public hasRuleCategory(): boolean {
    return this.props.ruleCategory !== null && this.props.ruleCategory !== undefined
  }

  /**
   * Obtém o tipo de regra de orçamento da categoria
   */
  public getRuleCategory(): 'necessidades' | 'desejos' | 'futuro' | null {
    return this.props.ruleCategory || null
  }

  /**
   * Valida se a categoria está em um estado válido
   */
  public validate(): void {
    if (!this.props.nome || this.props.nome.trim() === '') {
      throw new Error('Nome da categoria é obrigatório')
    }

    if (!this.props.userId) {
      throw new Error('Categoria deve estar associada a um usuário')
    }

    if (this.props.tipo === 'despesa' && !this.hasRuleCategory()) {
      throw new Error('Categorias de despesa devem ter uma regra de orçamento definida')
    }
  }
}