import { PrismaClient, FinancialAccountType } from '@prisma/client';

export interface CreateFinancialAccountData {
  nome?: string;
  tipo?: FinancialAccountType;
  instituicao?: string;
  saldoInicial?: number;
  saldoAtual?: number;
  cor?: string;
  icone?: string;
  ativa?: boolean;
  observacoes?: string;
  userId: string;
}

export class FinancialAccountFactory {
  private static counter = 0;
  
  private static readonly BANK_NAMES = [
    'Banco do Brasil',
    'Itaú',
    'Bradesco',
    'Santander',
    'Caixa Econômica',
    'Nubank',
    'C6 Bank',
    'Inter',
  ];
  
  private static readonly COLORS = [
    '#0066CC', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'
  ];

  constructor(private prisma: PrismaClient) {}

  /**
   * Create a single financial account
   */
  async create(data: CreateFinancialAccountData) {
    FinancialAccountFactory.counter++;
    
    const saldoInicial = data.saldoInicial ?? Math.floor(Math.random() * 10000) + 1000;
    
    const accountData = {
      nome: data.nome || `Account ${FinancialAccountFactory.counter}`,
      tipo: data.tipo || 'conta_corrente' as FinancialAccountType,
      instituicao: data.instituicao || this.getRandomBank(),
      saldoInicial: saldoInicial,
      saldoAtual: data.saldoAtual ?? saldoInicial,
      cor: data.cor || this.getRandomColor(),
      icone: data.icone,
      ativa: data.ativa ?? true,
      observacoes: data.observacoes,
      userId: data.userId,
    };

    return await this.prisma.financialAccount.create({
      data: accountData,
      include: {
        user: true,
        transactions: false,
        creditCards: false,
      },
    });
  }

  /**
   * Create multiple financial accounts
   */
  async createMany(count: number, baseData: CreateFinancialAccountData) {
    const accounts = [];
    
    for (let i = 0; i < count; i++) {
      const account = await this.create({
        ...baseData,
        nome: baseData.nome ? `${baseData.nome} ${i + 1}` : undefined,
        instituicao: this.getRandomBank(),
        cor: this.getRandomColor(),
      });
      accounts.push(account);
    }

    return accounts;
  }

  /**
   * Create checking account
   */
  async createCheckingAccount(data: Omit<CreateFinancialAccountData, 'tipo'>) {
    return this.create({
      ...data,
      tipo: 'conta_corrente',
      nome: data.nome || 'Conta Corrente',
      saldoInicial: data.saldoInicial || 2000,
    });
  }

  /**
   * Create savings account
   */
  async createSavingsAccount(data: Omit<CreateFinancialAccountData, 'tipo'>) {
    return this.create({
      ...data,
      tipo: 'conta_poupanca',
      nome: data.nome || 'Conta Poupança',
      saldoInicial: data.saldoInicial || 5000,
    });
  }

  /**
   * Create digital wallet
   */
  async createWallet(data: Omit<CreateFinancialAccountData, 'tipo'>) {
    return this.create({
      ...data,
      tipo: 'carteira',
      nome: data.nome || 'Carteira Digital',
      instituicao: data.instituicao || 'PayPal',
      saldoInicial: data.saldoInicial || 500,
    });
  }

  /**
   * Create investment account
   */
  async createInvestmentAccount(data: Omit<CreateFinancialAccountData, 'tipo'>) {
    return this.create({
      ...data,
      tipo: 'investimento',
      nome: data.nome || 'Conta de Investimentos',
      saldoInicial: data.saldoInicial || 10000,
    });
  }

  /**
   * Create account with transactions
   */
  async createWithTransactions(
    accountData: CreateFinancialAccountData,
    transactionCount: number = 5
  ) {
    const account = await this.create(accountData);
    
    // Create some sample transactions for this account
    const transactions = [];
    for (let i = 0; i < transactionCount; i++) {
      const isIncome = Math.random() > 0.3; // 70% chance of expense, 30% income
      const transaction = await this.prisma.transaction.create({
        data: {
          descricao: isIncome ? `Receita ${i + 1}` : `Despesa ${i + 1}`,
          valor: Math.floor(Math.random() * 500) + 50,
          tipo: isIncome ? 'receita' : 'despesa',
          data: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
          status: 'completed',
          contaFinanceiraId: account.id,
          userId: accountData.userId,
        },
      });
      transactions.push(transaction);
    }

    return { account, transactions };
  }

  /**
   * Create account with specific balance
   */
  async createWithBalance(balance: number, data: CreateFinancialAccountData) {
    return this.create({
      ...data,
      saldoInicial: balance,
      saldoAtual: balance,
    });
  }

  /**
   * Create set of typical accounts for a user
   */
  async createTypicalSet(userId: string) {
    const [checking, savings, wallet, investment] = await Promise.all([
      this.createCheckingAccount({
        userId,
        nome: 'Conta Corrente Principal',
        instituicao: 'Nubank',
        saldoInicial: 3000,
      }),
      this.createSavingsAccount({
        userId,
        nome: 'Poupança Reserva',
        instituicao: 'Itaú',
        saldoInicial: 15000,
      }),
      this.createWallet({
        userId,
        nome: 'Carteira PayPal',
        saldoInicial: 200,
      }),
      this.createInvestmentAccount({
        userId,
        nome: 'Investimentos XP',
        instituicao: 'XP Investimentos',
        saldoInicial: 25000,
      }),
    ]);

    return { checking, savings, wallet, investment };
  }

  /**
   * Create inactive account
   */
  async createInactive(data: CreateFinancialAccountData) {
    return this.create({
      ...data,
      ativa: false,
      nome: data.nome || 'Conta Inativa',
    });
  }

  private getRandomBank(): string {
    return FinancialAccountFactory.BANK_NAMES[
      Math.floor(Math.random() * FinancialAccountFactory.BANK_NAMES.length)
    ];
  }

  private getRandomColor(): string {
    return FinancialAccountFactory.COLORS[
      Math.floor(Math.random() * FinancialAccountFactory.COLORS.length)
    ];
  }

  /**
   * Reset the counter
   */
  static resetCounter(): void {
    FinancialAccountFactory.counter = 0;
  }
}

/**
 * Helper function to create a financial account factory
 */
export function createFinancialAccountFactory(prisma: PrismaClient): FinancialAccountFactory {
  return new FinancialAccountFactory(prisma);
}