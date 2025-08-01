export interface MerchantInfo {
  name?: string;
  businessName?: string;
  cnpj?: string;
}

export interface CategoryInfo {
  id?: string;
  description?: string;
}

export interface CreditCardMetadata {
  installmentNumber?: number;
  totalInstallments?: number;
  payeeMCC?: string;
  payeeName?: string;
  cardNumber?: string;
  billId?: string;
}

export class PluggyTransaction {
  constructor(
    private readonly id: string,
    private readonly accountId: string,
    private readonly amount: number,
    private readonly date: Date,
    private readonly description: string,
    private readonly descriptionRaw: string,
    private readonly currency: string,
    private readonly currencyCode: string,
    private readonly merchant: MerchantInfo | undefined,
    private readonly category: CategoryInfo | undefined,
    private readonly creditCardMetadata: CreditCardMetadata | undefined,
    private readonly createdAt: Date,
    private readonly updatedAt: Date
  ) {}

  public getId(): string {
    return this.id;
  }

  public getAccountId(): string {
    return this.accountId;
  }

  public getAmount(): number {
    return this.amount;
  }

  public getDate(): Date {
    return this.date;
  }

  public getDescription(): string {
    return this.description;
  }

  public getDescriptionRaw(): string {
    return this.descriptionRaw;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public getCurrencyCode(): string {
    return this.currencyCode;
  }

  public getMerchant(): MerchantInfo | undefined {
    return this.merchant;
  }

  public getCategory(): CategoryInfo | undefined {
    return this.category;
  }

  public getCreditCardMetadata(): CreditCardMetadata | undefined {
    return this.creditCardMetadata;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public toJSON() {
    return {
      id: this.id,
      accountId: this.accountId,
      amount: this.amount,
      date: this.date,
      description: this.description,
      descriptionRaw: this.descriptionRaw,
      currency: this.currency,
      currencyCode: this.currencyCode,
      merchant: this.merchant,
      category: this.category,
      creditCardMetadata: this.creditCardMetadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPluggyData(data: any): PluggyTransaction {
    return new PluggyTransaction(
      data.id,
      data.accountId,
      data.amount,
      new Date(data.date),
      data.description,
      data.descriptionRaw || '',
      data.currency || 'BRL',
      data.currencyCode || '986',
      data.merchant ? {
        name: data.merchant.name || '',
        businessName: data.merchant.businessName || '',
        cnpj: data.merchant.cnpj || '',
      } : undefined,
      data.category ? {
        id: data.category.id || '',
        description: data.category.description || '',
      } : undefined,
      data.creditCardMetadata ? {
        installmentNumber: data.creditCardMetadata.installmentNumber,
        totalInstallments: data.creditCardMetadata.totalInstallments,
        payeeMCC: data.creditCardMetadata.payeeMCC || '',
        payeeName: data.creditCardMetadata.payeeName || '',
        cardNumber: data.creditCardMetadata.cardNumber || '',
        billId: data.creditCardMetadata.billId || '',
      } : undefined,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
}