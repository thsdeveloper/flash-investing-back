export interface CreditCardProps {
  id?: string;
  nome: string;
  bandeira: 'visa' | 'mastercard' | 'elo' | 'american_express' | 'diners' | 'hipercard' | 'outros';
  ultimosDigitos: string;
  limiteTotal: number;
  limiteDisponivel?: number;
  diaVencimento: number;
  diaFechamento: number;
  banco?: string;
  cor?: string;
  ativo?: boolean;
  observacoes?: string;
  contaFinanceiraId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CreditCard {
  private readonly id?: string;
  private nome: string;
  private bandeira: 'visa' | 'mastercard' | 'elo' | 'american_express' | 'diners' | 'hipercard' | 'outros';
  private ultimosDigitos: string;
  private limiteTotal: number;
  private limiteDisponivel: number;
  private diaVencimento: number;
  private diaFechamento: number;
  private banco?: string;
  private cor?: string;
  private ativo: boolean;
  private observacoes?: string;
  private readonly contaFinanceiraId: string;
  private readonly userId: string;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: CreditCardProps) {
    this.id = props.id;
    this.nome = props.nome;
    this.bandeira = props.bandeira;
    this.ultimosDigitos = props.ultimosDigitos;
    this.limiteTotal = props.limiteTotal;
    this.limiteDisponivel = props.limiteDisponivel ?? props.limiteTotal;
    this.diaVencimento = props.diaVencimento;
    this.diaFechamento = props.diaFechamento;
    this.banco = props.banco;
    this.cor = props.cor;
    this.ativo = props.ativo ?? true;
    this.observacoes = props.observacoes;
    this.contaFinanceiraId = props.contaFinanceiraId;
    this.userId = props.userId;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  private validate(): void {
    if (!this.nome.trim()) {
      throw new Error('Nome do cartão é obrigatório');
    }

    if (!/^\d{4}$/.test(this.ultimosDigitos)) {
      throw new Error('Últimos dígitos devem conter exatamente 4 números');
    }

    if (this.limiteTotal <= 0) {
      throw new Error('Limite total deve ser maior que zero');
    }

    if (this.diaVencimento < 1 || this.diaVencimento > 31) {
      throw new Error('Dia de vencimento deve estar entre 1 e 31');
    }

    if (this.diaFechamento < 1 || this.diaFechamento > 31) {
      throw new Error('Dia de fechamento deve estar entre 1 e 31');
    }

    if (this.limiteDisponivel < 0) {
      throw new Error('Limite disponível não pode ser negativo');
    }

    if (this.limiteDisponivel > this.limiteTotal) {
      throw new Error('Limite disponível não pode ser maior que o limite total');
    }
  }

  getId(): string | undefined {
    return this.id;
  }

  getNome(): string {
    return this.nome;
  }

  getBandeira(): string {
    return this.bandeira;
  }

  getUltimosDigitos(): string {
    return this.ultimosDigitos;
  }

  getLimiteTotal(): number {
    return this.limiteTotal;
  }

  getLimiteDisponivel(): number {
    return this.limiteDisponivel;
  }

  getDiaVencimento(): number {
    return this.diaVencimento;
  }

  getDiaFechamento(): number {
    return this.diaFechamento;
  }

  getBanco(): string | undefined {
    return this.banco;
  }

  getCor(): string | undefined {
    return this.cor;
  }

  isAtivo(): boolean {
    return this.ativo;
  }

  getObservacoes(): string | undefined {
    return this.observacoes;
  }

  getContaFinanceiraId(): string {
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

  // Métodos de negócio
  updateNome(nome: string): void {
    if (!nome.trim()) {
      throw new Error('Nome do cartão é obrigatório');
    }
    this.nome = nome;
    this.updatedAt = new Date();
  }

  updateLimite(novoLimite: number): void {
    if (novoLimite <= 0) {
      throw new Error('Limite total deve ser maior que zero');
    }
    
    // Ajusta o limite disponível proporcionalmente
    const proporcaoUsada = (this.limiteTotal - this.limiteDisponivel) / this.limiteTotal;
    this.limiteTotal = novoLimite;
    this.limiteDisponivel = novoLimite * (1 - proporcaoUsada);
    this.updatedAt = new Date();
  }

  usarLimite(valor: number): void {
    if (valor <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }
    
    if (valor > this.limiteDisponivel) {
      throw new Error('Limite insuficiente');
    }
    
    this.limiteDisponivel -= valor;
    this.updatedAt = new Date();
  }

  liberarLimite(valor: number): void {
    if (valor <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }
    
    const novoLimiteDisponivel = this.limiteDisponivel + valor;
    
    if (novoLimiteDisponivel > this.limiteTotal) {
      this.limiteDisponivel = this.limiteTotal;
    } else {
      this.limiteDisponivel = novoLimiteDisponivel;
    }
    
    this.updatedAt = new Date();
  }

  ativar(): void {
    this.ativo = true;
    this.updatedAt = new Date();
  }

  desativar(): void {
    this.ativo = false;
    this.updatedAt = new Date();
  }

  updateDatas(diaFechamento: number, diaVencimento: number): void {
    if (diaFechamento < 1 || diaFechamento > 31) {
      throw new Error('Dia de fechamento deve estar entre 1 e 31');
    }
    
    if (diaVencimento < 1 || diaVencimento > 31) {
      throw new Error('Dia de vencimento deve estar entre 1 e 31');
    }
    
    this.diaFechamento = diaFechamento;
    this.diaVencimento = diaVencimento;
    this.updatedAt = new Date();
  }

  // Métodos utilitários
  getPercentualUso(): number {
    return ((this.limiteTotal - this.limiteDisponivel) / this.limiteTotal) * 100;
  }

  getValorUtilizado(): number {
    return this.limiteTotal - this.limiteDisponivel;
  }

  getMelhorDiaCompra(): number {
    // Calcula o melhor dia para compras (logo após o fechamento)
    return this.diaFechamento === 31 ? 1 : this.diaFechamento + 1;
  }

  getPrazoMaximoPagamento(): number {
    // Calcula quantos dias até o próximo vencimento
    let dias = this.diaVencimento - this.diaFechamento;
    if (dias <= 0) {
      dias += 30; // Assume mês de 30 dias para simplificar
    }
    return dias;
  }
}