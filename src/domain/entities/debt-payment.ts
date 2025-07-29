import { randomUUID } from 'crypto';

export type DebtPaymentType = 'pagamento_parcial' | 'quitacao_total';

export interface DebtPaymentProps {
  id: string;
  debtId: string;
  valor: number;
  dataPagamento: Date;
  tipo: DebtPaymentType;
  observacoes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DebtPayment {
  private constructor(private readonly props: DebtPaymentProps) {}

  static create(props: Omit<DebtPaymentProps, 'id' | 'createdAt' | 'updatedAt'>): DebtPayment {
    const now = new Date();
    return new DebtPayment({
      ...props,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: DebtPaymentProps): DebtPayment {
    return new DebtPayment(props);
  }

  static createPartialPayment(
    debtId: string,
    valor: number,
    dataPagamento: Date,
    userId: string,
    observacoes?: string
  ): DebtPayment {
    return DebtPayment.create({
      debtId,
      valor,
      dataPagamento,
      tipo: 'pagamento_parcial',
      observacoes,
      userId,
    });
  }

  static createFullPayment(
    debtId: string,
    valor: number,
    dataPagamento: Date,
    userId: string,
    observacoes?: string
  ): DebtPayment {
    return DebtPayment.create({
      debtId,
      valor,
      dataPagamento,
      tipo: 'quitacao_total',
      observacoes,
      userId,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get debtId(): string {
    return this.props.debtId;
  }

  get valor(): number {
    return this.props.valor;
  }

  get dataPagamento(): Date {
    return this.props.dataPagamento;
  }

  get tipo(): DebtPaymentType {
    return this.props.tipo;
  }

  get observacoes(): string | undefined {
    return this.props.observacoes;
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

  public isFullPayment(): boolean {
    return this.props.tipo === 'quitacao_total';
  }

  public isPartialPayment(): boolean {
    return this.props.tipo === 'pagamento_parcial';
  }

  public updateObservacoes(observacoes: string): void {
    this.props.observacoes = observacoes;
    this.touch();
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