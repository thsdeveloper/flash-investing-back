export enum RecommendationType {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD',
  STRONG_BUY = 'STRONG_BUY',
  STRONG_SELL = 'STRONG_SELL',
}

export enum RecommendationReason {
  TECHNICAL_ANALYSIS = 'TECHNICAL_ANALYSIS',
  FUNDAMENTAL_ANALYSIS = 'FUNDAMENTAL_ANALYSIS',
  MARKET_CONDITIONS = 'MARKET_CONDITIONS',
  RISK_MANAGEMENT = 'RISK_MANAGEMENT',
  PORTFOLIO_REBALANCING = 'PORTFOLIO_REBALANCING',
  DIVERSIFICATION = 'DIVERSIFICATION',
}

export interface InvestmentRecommendationProps {
  id: string;
  userId: string;
  assetId: string;
  type: RecommendationType;
  reason: RecommendationReason;
  targetPrice?: number;
  stopLoss?: number;
  confidence: number; // 0-100
  description: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class InvestmentRecommendation {
  private constructor(private props: InvestmentRecommendationProps) {}

  static create(data: Omit<InvestmentRecommendationProps, 'id' | 'createdAt' | 'updatedAt'>): InvestmentRecommendation {
    if (data.confidence < 0 || data.confidence > 100) {
      throw new Error('Confidence must be between 0 and 100');
    }

    return new InvestmentRecommendation({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: InvestmentRecommendationProps): InvestmentRecommendation {
    return new InvestmentRecommendation(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get assetId(): string {
    return this.props.assetId;
  }

  get type(): RecommendationType {
    return this.props.type;
  }

  get reason(): RecommendationReason {
    return this.props.reason;
  }

  get targetPrice(): number | undefined {
    return this.props.targetPrice;
  }

  get stopLoss(): number | undefined {
    return this.props.stopLoss;
  }

  get confidence(): number {
    return this.props.confidence;
  }

  get description(): string {
    return this.props.description;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get expiresAt(): Date | undefined {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isExpired(): boolean {
    return this.props.expiresAt ? new Date() > this.props.expiresAt : false;
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  updateConfidence(newConfidence: number): void {
    if (newConfidence < 0 || newConfidence > 100) {
      throw new Error('Confidence must be between 0 and 100');
    }
    
    this.props.confidence = newConfidence;
    this.props.updatedAt = new Date();
  }

  updateTargetPrice(newTargetPrice: number): void {
    this.props.targetPrice = newTargetPrice;
    this.props.updatedAt = new Date();
  }

  updateStopLoss(newStopLoss: number): void {
    this.props.stopLoss = newStopLoss;
    this.props.updatedAt = new Date();
  }

  toPlainObject(): InvestmentRecommendationProps {
    return { ...this.props };
  }
}