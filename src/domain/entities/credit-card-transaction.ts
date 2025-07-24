export class CreditCardTransaction {
  constructor(
    private readonly id: string | null,
    private readonly descricao: string,
    private readonly valor: number,
    private readonly categoria: string | null,
    private readonly subcategoria: string | null,
    private readonly dataCompra: Date,
    private readonly parcelas: number,
    private readonly parcelaAtual: number,
    private readonly estabelecimento: string | null,
    private readonly observacoes: string | null,
    private readonly creditCardId: string,
    private readonly invoiceId: string | null,
    private readonly userId: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date
  ) {}

  public getId(): string | null {
    return this.id;
  }

  public getDescricao(): string {
    return this.descricao;
  }

  public getValor(): number {
    return this.valor;
  }

  public getCategoria(): string | null {
    return this.categoria;
  }

  public getSubcategoria(): string | null {
    return this.subcategoria;
  }

  public getDataCompra(): Date {
    return this.dataCompra;
  }

  public getParcelas(): number {
    return this.parcelas;
  }

  public getParcelaAtual(): number {
    return this.parcelaAtual;
  }

  public getEstabelecimento(): string | null {
    return this.estabelecimento;
  }

  public getObservacoes(): string | null {
    return this.observacoes;
  }

  public getCreditCardId(): string {
    return this.creditCardId;
  }

  public getInvoiceId(): string | null {
    return this.invoiceId;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Métodos de negócio
  public isParcelada(): boolean {
    return this.parcelas > 1;
  }

  public isUltimaParcela(): boolean {
    return this.parcelaAtual === this.parcelas;
  }

  public getParcelaDescricao(): string {
    if (this.isParcelada()) {
      return `${this.parcelaAtual}/${this.parcelas}`;
    }
    return 'À vista';
  }

  public getValorParcela(): number {
    return this.valor / this.parcelas;
  }

  public getValorTotal(): number {
    return this.valor;
  }

  public static create(props: {
    descricao: string;
    valor: number;
    categoria?: string;
    subcategoria?: string;
    dataCompra: Date;
    parcelas?: number;
    parcelaAtual?: number;
    estabelecimento?: string;
    observacoes?: string;
    creditCardId: string;
    invoiceId?: string;
    userId: string;
  }): CreditCardTransaction {
    return new CreditCardTransaction(
      null,
      props.descricao,
      props.valor,
      props.categoria || null,
      props.subcategoria || null,
      props.dataCompra,
      props.parcelas || 1,
      props.parcelaAtual || 1,
      props.estabelecimento || null,
      props.observacoes || null,
      props.creditCardId,
      props.invoiceId || null,
      props.userId,
      new Date(),
      new Date()
    );
  }
}