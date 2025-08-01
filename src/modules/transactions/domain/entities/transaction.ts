export type TransactionType = 'receita' | 'despesa' | 'transferencia';
export type TransactionStatus = 'pending' | 'completed';

export interface TransactionProps {
  id?: string;
  descricao: string;
  valor: number;
  tipo: TransactionType;
  categoria?: string;  // Mantido temporariamente para compatibilidade
  categoriaId?: string;  // Nova FK para FinancialCategory
  subcategoria?: string;
  data: Date;
  status?: TransactionStatus;
  observacoes?: string;
  contaFinanceiraId?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Transaction {
  private readonly id?: string;
  private descricao: string;
  private valor: number;
  private tipo: TransactionType;
  private categoria?: string;  // Mantido temporariamente para compatibilidade
  private categoriaId?: string;  // Nova FK para FinancialCategory
  private subcategoria?: string;
  private data: Date;
  private status: TransactionStatus;
  private observacoes?: string;
  private contaFinanceiraId?: string;
  private readonly userId: string;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: TransactionProps) {
    this.id = props.id;
    this.descricao = props.descricao;
    this.valor = props.valor;
    this.tipo = props.tipo;
    this.categoria = props.categoria;
    this.categoriaId = props.categoriaId;
    this.subcategoria = props.subcategoria;
    this.data = props.data;
    this.status = props.status || 'pending';
    this.observacoes = props.observacoes;
    this.contaFinanceiraId = props.contaFinanceiraId;
    this.userId = props.userId;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  static create(props: TransactionProps): Transaction {
    if (!props.descricao || props.descricao.trim().length === 0) {
      throw new Error('Descrição da transação é obrigatória');
    }

    if (props.valor <= 0) {
      throw new Error('Valor da transação deve ser maior que zero');
    }

    if (!['receita', 'despesa', 'transferencia'].includes(props.tipo)) {
      throw new Error('Tipo de transação inválido. Deve ser "receita", "despesa" ou "transferencia"');
    }

    if (props.data > new Date()) {
      throw new Error('Data da transação não pode ser no futuro');
    }

    return new Transaction(props);
  }

  getId(): string | undefined {
    return this.id;
  }

  getDescricao(): string {
    return this.descricao;
  }

  getValor(): number {
    return this.valor;
  }

  getTipo(): TransactionType {
    return this.tipo;
  }

  getCategoria(): string | undefined {
    return this.categoria;
  }

  getCategoriaId(): string | undefined {
    return this.categoriaId;
  }

  getSubcategoria(): string | undefined {
    return this.subcategoria;
  }

  getData(): Date {
    return this.data;
  }

  getObservacoes(): string | undefined {
    return this.observacoes;
  }

  getContaFinanceiraId(): string | undefined {
    return this.contaFinanceiraId;
  }

  getUserId(): string {
    return this.userId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getStatus(): TransactionStatus {
    return this.status;
  }

  updateDescricao(descricao: string): void {
    if (!descricao || descricao.trim().length === 0) {
      throw new Error('Descrição da transação é obrigatória');
    }
    this.descricao = descricao;
    this.updatedAt = new Date();
  }

  updateValor(valor: number): void {
    if (valor <= 0) {
      throw new Error('Valor da transação deve ser maior que zero');
    }
    this.valor = valor;
    this.updatedAt = new Date();
  }

  updateTipo(tipo: TransactionType): void {
    if (!['receita', 'despesa', 'transferencia'].includes(tipo)) {
      throw new Error('Tipo de transação inválido. Deve ser "receita", "despesa" ou "transferencia"');
    }
    this.tipo = tipo;
    this.updatedAt = new Date();
  }

  updateCategoria(categoria?: string): void {
    this.categoria = categoria;
    this.updatedAt = new Date();
  }

  updateCategoriaId(categoriaId?: string): void {
    this.categoriaId = categoriaId;
    this.updatedAt = new Date();
  }

  updateSubcategoria(subcategoria?: string): void {
    this.subcategoria = subcategoria;
    this.updatedAt = new Date();
  }

  updateData(data: Date): void {
    if (data > new Date()) {
      throw new Error('Data da transação não pode ser no futuro');
    }
    this.data = data;
    this.updatedAt = new Date();
  }

  updateObservacoes(observacoes?: string): void {
    this.observacoes = observacoes;
    this.updatedAt = new Date();
  }

  updateContaFinanceira(contaFinanceiraId?: string): void {
    this.contaFinanceiraId = contaFinanceiraId;
    this.updatedAt = new Date();
  }

  updateStatus(status: TransactionStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  markAsCompleted(): void {
    this.updateStatus('completed');
  }

  markAsPending(): void {
    this.updateStatus('pending');
  }

  isReceita(): boolean {
    return this.tipo === 'receita';
  }

  isDespesa(): boolean {
    return this.tipo === 'despesa';
  }

  isTransferencia(): boolean {
    return this.tipo === 'transferencia';
  }

  isPending(): boolean {
    return this.status === 'pending';
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  belongsToUser(userId: string): boolean {
    return this.userId === userId;
  }

  belongsToAccount(contaFinanceiraId: string): boolean {
    return this.contaFinanceiraId === contaFinanceiraId;
  }
}