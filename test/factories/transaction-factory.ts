import { PrismaClient, TransactionType, TransactionStatus } from '@prisma/client';

export interface CreateTransactionData {
  descricao?: string;
  valor?: number;
  tipo?: TransactionType;
  categoria?: string;
  categoriaId?: string;
  subcategoria?: string;
  data?: Date;
  status?: TransactionStatus;
  observacoes?: string;
  contaFinanceiraId?: string;
  userId: string;
}

export class TransactionFactory {
  private static counter = 0;

  constructor(private prisma: PrismaClient) {}

  /**
   * Create a single transaction
   */
  async create(data: CreateTransactionData) {
    TransactionFactory.counter++;

    const transactionData = {
      descricao: data.descricao || `Transaction ${TransactionFactory.counter}`,
      valor: data.valor || Math.floor(Math.random() * 1000) + 10, // Random amount between 10-1010
      tipo: data.tipo || 'despesa' as TransactionType,
      categoria: data.categoria,
      categoriaId: data.categoriaId,
      subcategoria: data.subcategoria,
      data: data.data || new Date(),
      status: data.status || 'completed' as TransactionStatus,
      observacoes: data.observacoes,
      contaFinanceiraId: data.contaFinanceiraId,
      userId: data.userId,
    };

    return await this.prisma.transaction.create({
      data: transactionData,
      include: {
        user: true,
        contaFinanceira: true,
        categoriaFinanceira: true,
      },
    });
  }

  /**
   * Create multiple transactions
   */
  async createMany(count: number, baseData: CreateTransactionData) {
    const transactions = [];
    
    for (let i = 0; i < count; i++) {
      const transaction = await this.create({
        ...baseData,
        descricao: baseData.descricao ? `${baseData.descricao} ${i + 1}` : undefined,
        valor: baseData.valor || Math.floor(Math.random() * 500) + 50,
      });
      transactions.push(transaction);
    }

    return transactions;
  }

  /**
   * Create income transaction
   */
  async createIncome(data: Omit<CreateTransactionData, 'tipo'>) {
    return this.create({
      ...data,
      tipo: 'receita',
      descricao: data.descricao || 'Receita de Teste',
      valor: data.valor || Math.floor(Math.random() * 2000) + 500,
    });
  }

  /**
   * Create expense transaction
   */
  async createExpense(data: Omit<CreateTransactionData, 'tipo'>) {
    return this.create({
      ...data,
      tipo: 'despesa',
      descricao: data.descricao || 'Despesa de Teste',
      valor: data.valor || Math.floor(Math.random() * 500) + 20,
    });
  }

  /**
   * Create pending transaction
   */
  async createPending(data: Omit<CreateTransactionData, 'status'>) {
    return this.create({
      ...data,
      status: 'pending',
      descricao: data.descricao || 'Transação Pendente',
    });
  }

  /**
   * Create transaction with category
   */
  async createWithCategory(data: CreateTransactionData) {
    // First ensure we have a category
    let categoryId = data.categoriaId;
    
    if (!categoryId) {
      const category = await this.prisma.financialCategory.create({
        data: {
          nome: 'Categoria Teste',
          icone: '💳',
          cor: '#FF6B6B',
          tipo: data.tipo === 'receita' ? 'receita' : 'despesa',
          ruleCategory: 'necessidades',
          ativa: true,
          userId: data.userId,
        },
      });
      categoryId = category.id;
    }

    return this.create({
      ...data,
      categoriaId: categoryId,
    });
  }

  /**
   * Create transaction with financial account
   */
  async createWithAccount(data: CreateTransactionData) {
    // First ensure we have an account
    let accountId = data.contaFinanceiraId;
    
    if (!accountId) {
      const account = await this.prisma.financialAccount.create({
        data: {
          nome: 'Conta Teste',
          tipo: 'conta_corrente',
          saldoInicial: 1000,
          saldoAtual: 1000,
          ativa: true,
          userId: data.userId,
        },
      });
      accountId = account.id;
    }

    return this.create({
      ...data,
      contaFinanceiraId: accountId,
    });
  }

  /**
   * Create transactions for a date range
   */
  async createForDateRange(
    startDate: Date,
    endDate: Date,
    count: number,
    baseData: CreateTransactionData
  ) {
    const transactions = [];
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < count; i++) {
      const randomDays = Math.floor(Math.random() * daysDiff);
      const transactionDate = new Date(startDate.getTime() + randomDays * 24 * 60 * 60 * 1000);
      
      const transaction = await this.create({
        ...baseData,
        data: transactionDate,
      });
      transactions.push(transaction);
    }

    return transactions.sort((a, b) => a.data.getTime() - b.data.getTime());
  }

  /**
   * Create monthly transactions
   */
  async createMonthlyTransactions(year: number, month: number, baseData: CreateTransactionData) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Create various transactions throughout the month
    const incomes = await this.createForDateRange(
      startDate, 
      endDate, 
      3, 
      { ...baseData, tipo: 'receita', valor: 1500 }
    );
    
    const expenses = await this.createForDateRange(
      startDate, 
      endDate, 
      15, 
      { ...baseData, tipo: 'despesa', valor: 200 }
    );

    return { incomes, expenses };
  }

  /**
   * Reset the counter
   */
  static resetCounter(): void {
    TransactionFactory.counter = 0;
  }
}

/**
 * Helper function to create a transaction factory
 */
export function createTransactionFactory(prisma: PrismaClient): TransactionFactory {
  return new TransactionFactory(prisma);
}