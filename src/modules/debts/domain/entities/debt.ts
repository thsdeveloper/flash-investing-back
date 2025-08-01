import { randomUUID } from 'crypto';

export type DebtType = 'cartao_credito' | 'emprestimo_pessoal' | 'financiamento' | 'cheque_especial' | 'outros';
export type DebtStatus = 'ativa' | 'quitada' | 'em_negociacao' | 'vencida';

export interface DebtProps {
  id: string;
  credor: string;
  tipoDiv: DebtType;
  valorOriginal: number;
  valorAtual: number;
  taxaJuros?: number;
  dataVencimento: Date;
  status: DebtStatus;
  descricao?: string;
  parcelasTotal?: number;
  valorParcela?: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Debt {
  private constructor(private readonly props: DebtProps) {}

  static create(props: Omit<DebtProps, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'valorAtual'>): Debt {
    const now = new Date();
    return new Debt({
      ...props,
      id: randomUUID(),
      valorAtual: props.valorOriginal,
      status: 'ativa',
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: DebtProps): Debt {
    return new Debt(props);
  }

  get id(): string {
    return this.props.id;
  }

  get credor(): string {
    return this.props.credor;
  }

  get tipoDiv(): DebtType {
    return this.props.tipoDiv;
  }

  get valorOriginal(): number {
    return this.props.valorOriginal;
  }

  get valorAtual(): number {
    return this.props.valorAtual;
  }

  get taxaJuros(): number | undefined {
    return this.props.taxaJuros;
  }

  get dataVencimento(): Date {
    return this.props.dataVencimento;
  }

  get status(): DebtStatus {
    return this.props.status;
  }

  get descricao(): string | undefined {
    return this.props.descricao;
  }

  get parcelasTotal(): number | undefined {
    return this.props.parcelasTotal;
  }

  get valorParcela(): number | undefined {
    return this.props.valorParcela;
  }

  get userId(): string {
    return this.props.userId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateCredor(credor: string): void {
    this.props.credor = credor;
    this.touch();
  }

  public updateTaxaJuros(taxaJuros: number): void {
    this.props.taxaJuros = taxaJuros;
    this.touch();
  }

  public updateDataVencimento(dataVencimento: Date): void {
    this.props.dataVencimento = dataVencimento;
    this.touch();
  }

  public updateDescricao(descricao: string): void {
    this.props.descricao = descricao;
    this.touch();
  }

  public updateStatus(status: DebtStatus): void {
    this.props.status = status;
    this.touch();
  }

  public registerPayment(valor: number): void {
    if (valor <= 0) {
      throw new Error('Valor do pagamento deve ser positivo');
    }

    if (valor > this.props.valorAtual) {
      throw new Error('Valor do pagamento não pode ser maior que o saldo devedor');
    }

    this.props.valorAtual -= valor;
    
    if (this.props.valorAtual === 0) {
      this.props.status = 'quitada';
    }

    this.touch();
  }

  public calculateInterest(): number {
    if (!this.props.taxaJuros) return 0;
    
    const monthlyRate = this.props.taxaJuros / 100 / 12;
    const daysSinceCreation = Math.floor((Date.now() - this.props.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const monthsElapsed = daysSinceCreation / 30;
    
    return this.props.valorAtual * monthlyRate * monthsElapsed;
  }

  public isOverdue(): boolean {
    return this.props.dataVencimento < new Date() && this.props.status === 'ativa';
  }

  public markAsOverdue(): void {
    if (this.isOverdue()) {
      this.props.status = 'vencida';
      this.touch();
    }
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return {
      ...this.props,
    };
  }
}