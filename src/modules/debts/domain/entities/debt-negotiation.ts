import { randomUUID } from 'crypto';

export type DebtNegotiationStatus = 'pendente' | 'aceita' | 'rejeitada' | 'em_andamento';

export interface DebtNegotiationProps {
  id: string;
  debtId: string;
  dataNegociacao: Date;
  proposta: string;
  status: DebtNegotiationStatus;
  observacoes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DebtNegotiation {
  private constructor(private readonly props: DebtNegotiationProps) {}

  static create(props: Omit<DebtNegotiationProps, 'id' | 'createdAt' | 'updatedAt'>): DebtNegotiation {
    const now = new Date();
    return new DebtNegotiation({
      ...props,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: DebtNegotiationProps): DebtNegotiation {
    return new DebtNegotiation(props);
  }

  get id(): string {
    return this.props.id;
  }

  get debtId(): string {
    return this.props.debtId;
  }

  get dataNegociacao(): Date {
    return this.props.dataNegociacao;
  }

  get proposta(): string {
    return this.props.proposta;
  }

  get status(): DebtNegotiationStatus {
    return this.props.status;
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

  public accept(observacoes?: string): void {
    this.props.status = 'aceita';
    if (observacoes) {
      this.props.observacoes = observacoes;
    }
    this.touch();
  }

  public reject(observacoes?: string): void {
    this.props.status = 'rejeitada';
    if (observacoes) {
      this.props.observacoes = observacoes;
    }
    this.touch();
  }

  public startProgress(observacoes?: string): void {
    this.props.status = 'em_andamento';
    if (observacoes) {
      this.props.observacoes = observacoes;
    }
    this.touch();
  }

  public updateStatus(status: DebtNegotiationStatus): void {
    this.props.status = status;
    this.touch();
  }

  public updateObservacoes(observacoes: string): void {
    this.props.observacoes = observacoes;
    this.touch();
  }

  public isPending(): boolean {
    return this.props.status === 'pendente';
  }

  public isAccepted(): boolean {
    return this.props.status === 'aceita';
  }

  public isRejected(): boolean {
    return this.props.status === 'rejeitada';
  }

  public isInProgress(): boolean {
    return this.props.status === 'em_andamento';
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