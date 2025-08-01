export enum AssetType {
  STOCK = 'STOCK',
  BOND = 'BOND',
  FUND = 'FUND',
  ETF = 'ETF',
  REIT = 'REIT',
  CRYPTO = 'CRYPTO',
  COMMODITY = 'COMMODITY',
}

export enum AssetRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export interface InvestmentAssetProps {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  riskLevel: AssetRiskLevel;
  sector?: string;
  currentPrice: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class InvestmentAsset {
  private constructor(private props: InvestmentAssetProps) {}

  static create(data: Omit<InvestmentAssetProps, 'id' | 'createdAt' | 'updatedAt'>): InvestmentAsset {
    return new InvestmentAsset({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: InvestmentAssetProps): InvestmentAsset {
    return new InvestmentAsset(props);
  }

  get id(): string {
    return this.props.id;
  }

  get symbol(): string {
    return this.props.symbol;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): AssetType {
    return this.props.type;
  }

  get riskLevel(): AssetRiskLevel {
    return this.props.riskLevel;
  }

  get sector(): string | undefined {
    return this.props.sector;
  }

  get currentPrice(): number {
    return this.props.currentPrice;
  }

  get currency(): string {
    return this.props.currency;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updatePrice(newPrice: number): void {
    this.props.currentPrice = newPrice;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  toPlainObject(): InvestmentAssetProps {
    return { ...this.props };
  }
}