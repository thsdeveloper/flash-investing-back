export interface ConnectorCredential {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  validation?: string;
  validationMessage?: string;
  optional?: boolean;
}

export class Connector {
  constructor(
    private readonly id: number,
    private readonly name: string,
    private readonly institutionUrl: string,
    private readonly imageUrl: string,
    private readonly primaryColor: string,
    private readonly type: string,
    private readonly country: string,
    private readonly credentials: ConnectorCredential[],
    private readonly products: string[],
    private readonly createdAt?: Date,
    private readonly updatedAt?: Date
  ) {}

  public getId(): number {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getInstitutionUrl(): string {
    return this.institutionUrl;
  }

  public getImageUrl(): string {
    return this.imageUrl;
  }

  public getPrimaryColor(): string {
    return this.primaryColor;
  }

  public getType(): string {
    return this.type;
  }

  public getCountry(): string {
    return this.country;
  }

  public getCredentials(): ConnectorCredential[] {
    return this.credentials;
  }

  public getProducts(): string[] {
    return this.products;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      institutionUrl: this.institutionUrl,
      imageUrl: this.imageUrl,
      primaryColor: this.primaryColor,
      type: this.type,
      country: this.country,
      credentials: this.credentials,
      products: this.products,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPluggyData(data: any): Connector {
    return new Connector(
      data.id,
      data.name,
      data.institutionUrl || '',
      data.imageUrl || '',
      data.primaryColor || '#000000',
      data.type || 'PERSONAL_BANK',
      data.country || 'BR',
      data.credentials || [],
      data.products || [],
      data.createdAt ? new Date(data.createdAt) : undefined,
      data.updatedAt ? new Date(data.updatedAt) : undefined
    );
  }
}