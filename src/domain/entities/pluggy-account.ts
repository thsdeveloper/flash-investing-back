export interface BankInfo {
  name: string;
  fullName?: string;
  numberCode?: string;
}

export class PluggyAccount {
  constructor(
    private readonly id: string,
    private readonly itemId: string,
    private readonly type: string,
    private readonly subtype: string,
    private readonly number: string,
    private readonly name: string,
    private readonly marketingName: string,
    private readonly balance: number,
    private readonly currency: string,
    private readonly currencyCode: string,
    private readonly creditLimit: number,
    private readonly owner: string,
    private readonly taxNumber: string,
    private readonly bank: BankInfo | undefined,
    private readonly createdAt: Date,
    private readonly updatedAt: Date
  ) {}

  public getId(): string {
    return this.id;
  }

  public getItemId(): string {
    return this.itemId;
  }

  public getType(): string {
    return this.type;
  }

  public getSubtype(): string {
    return this.subtype;
  }

  public getNumber(): string {
    return this.number;
  }

  public getName(): string {
    return this.name;
  }

  public getMarketingName(): string {
    return this.marketingName;
  }

  public getBalance(): number {
    return this.balance;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public getCurrencyCode(): string {
    return this.currencyCode;
  }

  public getCreditLimit(): number {
    return this.creditLimit;
  }

  public getOwner(): string {
    return this.owner;
  }

  public getTaxNumber(): string {
    return this.taxNumber;
  }

  public getBank(): BankInfo | undefined {
    return this.bank;
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
      itemId: this.itemId,
      type: this.type,
      subtype: this.subtype,
      number: this.number,
      name: this.name,
      marketingName: this.marketingName,
      balance: this.balance,
      currency: this.currency,
      currencyCode: this.currencyCode,
      creditLimit: this.creditLimit,
      owner: this.owner,
      taxNumber: this.taxNumber,
      bank: this.bank,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPluggyData(data: any): PluggyAccount {
    return new PluggyAccount(
      data.id,
      data.itemId,
      data.type,
      data.subtype,
      data.number,
      data.name,
      data.marketingName || '',
      data.balance,
      data.currency || 'BRL',
      data.currencyCode || '986',
      data.creditLimit || 0,
      data.owner || '',
      data.taxNumber || '',
      data.bank ? {
        name: data.bank.name,
        fullName: data.bank.fullName || '',
        numberCode: data.bank.numberCode || '',
      } : undefined,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
}