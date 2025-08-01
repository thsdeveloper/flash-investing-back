export interface PortfolioPositionProps {
  id: string;
  portfolioId: string;
  assetId: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PortfolioPosition {
  private constructor(private props: PortfolioPositionProps) {}

  static create(data: {
    portfolioId: string;
    assetId: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
  }): PortfolioPosition {
    const totalInvested = data.quantity * data.averagePrice;
    const currentValue = data.quantity * data.currentPrice;
    const profitLoss = currentValue - totalInvested;
    const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return new PortfolioPosition({
      id: crypto.randomUUID(),
      portfolioId: data.portfolioId,
      assetId: data.assetId,
      quantity: data.quantity,
      averagePrice: data.averagePrice,
      currentPrice: data.currentPrice,
      totalInvested,
      currentValue,
      profitLoss,
      profitLossPercentage,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: PortfolioPositionProps): PortfolioPosition {
    return new PortfolioPosition(props);
  }

  get id(): string {
    return this.props.id;
  }

  get portfolioId(): string {
    return this.props.portfolioId;
  }

  get assetId(): string {
    return this.props.assetId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get averagePrice(): number {
    return this.props.averagePrice;
  }

  get currentPrice(): number {
    return this.props.currentPrice;
  }

  get totalInvested(): number {
    return this.props.totalInvested;
  }

  get currentValue(): number {
    return this.props.currentValue;
  }

  get profitLoss(): number {
    return this.props.profitLoss;
  }

  get profitLossPercentage(): number {
    return this.props.profitLossPercentage;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateCurrentPrice(newPrice: number): void {
    this.props.currentPrice = newPrice;
    this.recalculateValues();
  }

  addQuantity(quantity: number, price: number): void {
    const newTotalInvested = this.props.totalInvested + (quantity * price);
    const newQuantity = this.props.quantity + quantity;
    
    this.props.averagePrice = newTotalInvested / newQuantity;
    this.props.quantity = newQuantity;
    this.props.totalInvested = newTotalInvested;
    
    this.recalculateValues();
  }

  removeQuantity(quantity: number): void {
    if (quantity > this.props.quantity) {
      throw new Error('Cannot remove more quantity than available');
    }

    const removedValue = quantity * this.props.averagePrice;
    this.props.quantity -= quantity;
    this.props.totalInvested -= removedValue;

    this.recalculateValues();
  }

  private recalculateValues(): void {
    this.props.currentValue = this.props.quantity * this.props.currentPrice;
    this.props.profitLoss = this.props.currentValue - this.props.totalInvested;
    this.props.profitLossPercentage = this.props.totalInvested > 0 
      ? (this.props.profitLoss / this.props.totalInvested) * 100 
      : 0;
    this.props.updatedAt = new Date();
  }

  toPlainObject(): PortfolioPositionProps {
    return { ...this.props };
  }
}