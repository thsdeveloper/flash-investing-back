export interface InvestmentPortfolioProps {
  id: string;
  userId: string;
  name: string;
  description?: string;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export class InvestmentPortfolio {
  private constructor(private props: InvestmentPortfolioProps) {}

  static create(data: Omit<InvestmentPortfolioProps, 'id' | 'createdAt' | 'updatedAt'>): InvestmentPortfolio {
    return new InvestmentPortfolio({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: InvestmentPortfolioProps): InvestmentPortfolio {
    return new InvestmentPortfolio(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get totalValue(): number {
    return this.props.totalValue;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateTotalValue(newValue: number): void {
    this.props.totalValue = newValue;
    this.props.updatedAt = new Date();
  }

  updateName(newName: string): void {
    this.props.name = newName;
    this.props.updatedAt = new Date();
  }

  updateDescription(newDescription: string): void {
    this.props.description = newDescription;
    this.props.updatedAt = new Date();
  }

  toPlainObject(): InvestmentPortfolioProps {
    return { ...this.props };
  }
}