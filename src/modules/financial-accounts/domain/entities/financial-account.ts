export type FinancialAccountType = 'conta_corrente' | 'conta_poupanca' | 'carteira' | 'investimento' | 'outras';

export interface FinancialAccountProps {
  id?: string;
  nome: string;
  tipo: FinancialAccountType;
  instituicao?: string;
  saldoInicial: number;
  saldoAtual: number;
  cor?: string;
  icone?: string;
  ativa: boolean;
  observacoes?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class FinancialAccount {
  private readonly id?: string;
  private nome: string;
  private tipo: FinancialAccountType;
  private instituicao?: string;
  private saldoInicial: number;
  private saldoAtual: number;
  private cor?: string;
  private icone?: string;
  private ativa: boolean;
  private observacoes?: string;
  private readonly userId: string;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: FinancialAccountProps) {
    this.id = props.id;
    this.nome = props.nome;
    this.tipo = props.tipo;
    this.instituicao = props.instituicao;
    this.saldoInicial = props.saldoInicial;
    this.saldoAtual = props.saldoAtual;
    this.cor = props.cor;
    this.icone = props.icone;
    this.ativa = props.ativa;
    this.observacoes = props.observacoes;
    this.userId = props.userId;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  getId(): string | undefined {
    return this.id;
  }

  getNome(): string {
    return this.nome;
  }

  getTipo(): FinancialAccountType {
    return this.tipo;
  }

  getInstituicao(): string | undefined {
    return this.instituicao;
  }

  getSaldoInicial(): number {
    return this.saldoInicial;
  }

  getSaldoAtual(): number {
    return this.saldoAtual;
  }

  getCor(): string | undefined {
    return this.cor;
  }

  getIcone(): string | undefined {
    return this.icone;
  }

  isAtiva(): boolean {
    return this.ativa;
  }

  getObservacoes(): string | undefined {
    return this.observacoes;
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

  updateNome(nome: string): void {
    this.nome = nome;
    this.updatedAt = new Date();
  }

  updateTipo(tipo: FinancialAccountType): void {
    this.tipo = tipo;
    this.updatedAt = new Date();
  }

  updateInstituicao(instituicao?: string): void {
    this.instituicao = instituicao;
    this.updatedAt = new Date();
  }

  updateSaldo(novoSaldo: number): void {
    this.saldoAtual = novoSaldo;
    this.updatedAt = new Date();
  }

  adicionarValor(valor: number): void {
    this.saldoAtual += valor;
    this.updatedAt = new Date();
  }

  subtrairValor(valor: number): void {
    this.saldoAtual -= valor;
    this.updatedAt = new Date();
  }

  updateCor(cor?: string): void {
    this.cor = cor;
    this.updatedAt = new Date();
  }

  updateIcone(icone?: string): void {
    this.icone = icone;
    this.updatedAt = new Date();
  }

  ativar(): void {
    this.ativa = true;
    this.updatedAt = new Date();
  }

  desativar(): void {
    this.ativa = false;
    this.updatedAt = new Date();
  }

  updateObservacoes(observacoes?: string): void {
    this.observacoes = observacoes;
    this.updatedAt = new Date();
  }

  transferirPara(destino: FinancialAccount, valor: number): void {
    if (valor <= 0) {
      throw new Error('Valor da transferência deve ser positivo');
    }

    if (this.saldoAtual < valor) {
      throw new Error('Saldo insuficiente para transferência');
    }

    this.subtrairValor(valor);
    destino.adicionarValor(valor);
  }

  /**
   * Verifica se a conta tem saldo disponível para uma operação
   */
  hasAvailableBalance(valor: number): boolean {
    // Conta corrente pode ter saldo negativo (cheque especial)
    if (this.tipo === 'conta_corrente') {
      return true; // Assumindo que conta corrente tem limite
    }
    
    return this.saldoAtual >= valor;
  }

  /**
   * Verifica se a conta pode ser usada para transações
   */
  canMakeTransaction(): boolean {
    return this.ativa;
  }

  /**
   * Valida se a conta está em um estado válido
   */
  validate(): void {
    if (!this.nome || this.nome.trim() === '') {
      throw new Error('Nome da conta é obrigatório');
    }

    if (this.saldoInicial < 0) {
      throw new Error('Saldo inicial não pode ser negativo');
    }

    if (!this.userId) {
      throw new Error('Conta deve estar associada a um usuário');
    }
  }

  /**
   * Calcula o limite disponível (para conta corrente)
   */
  getAvailableLimit(): number {
    if (this.tipo === 'conta_corrente') {
      // Assumindo limite de R$ 1000 para conta corrente
      const limite = 1000;
      return limite + this.saldoAtual;
    }
    
    return Math.max(0, this.saldoAtual);
  }
}