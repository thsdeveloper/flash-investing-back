import { PrismaClient } from '@prisma/client';
import { TestEnvironment } from './test-env';

export class DatabaseTestHelper {
  constructor(private prisma: PrismaClient) {}

  /**
   * Clean specific tables in the correct order to avoid foreign key constraints
   */
  async cleanTables(tables?: string[]): Promise<void> {
    const allTables = [
      // Tables with foreign keys first (children)
      'refresh_tokens',
      'transactions',
      'account_transfers',
      'credit_card_transactions',
      'credit_card_invoices',
      'credit_cards',
      'financial_categories',
      'debt_negotiations',
      'debt_payments',
      'debts',
      'user_finance_settings',
      'financial_accounts',
      // Parent tables last
      'users'
    ];

    const tablesToClean = tables || allTables;

    // Check which tables exist and clean only those
    for (const table of tablesToClean) {
      if (allTables.includes(table)) {
        try {
          // Check if table exists first
          await this.prisma.$queryRawUnsafe(`SELECT 1 FROM "${table}" LIMIT 1`);
          // If no error, table exists, so clean it
          await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
        } catch (error: any) {
          // If table doesn't exist, skip it silently
          if (error?.code !== 'P2010' && error?.code !== '42P01') {
            // Re-throw if it's not a "table doesn't exist" error
            throw error;
          }
        }
      }
    }
  }

  /**
   * Clean all data from the database
   */
  async cleanAllData(): Promise<void> {
    await this.cleanTables();
  }

  /**
   * Clean specific user data by user ID
   */
  async cleanUserData(userId: string): Promise<void> {
    // Delete in correct order to avoid FK constraint errors
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    await this.prisma.transaction.deleteMany({ where: { userId } });
    await this.prisma.accountTransfer.deleteMany({ where: { userId } });
    await this.prisma.creditCardTransaction.deleteMany({ where: { userId } });
    await this.prisma.creditCardInvoice.deleteMany({ where: { userId } });
    await this.prisma.creditCard.deleteMany({ where: { userId } });
    await this.prisma.financialCategory.deleteMany({ where: { userId } });
    await this.prisma.debtNegotiation.deleteMany({ where: { userId } });
    await this.prisma.debtPayment.deleteMany({ where: { userId } });
    await this.prisma.debt.deleteMany({ where: { userId } });
    await this.prisma.userFinanceSettings.deleteMany({ where: { userId } });
    await this.prisma.investmentPortfolio.deleteMany({ where: { userId } });
    await this.prisma.investmentRecommendation.deleteMany({ where: { userId } });
    await this.prisma.financialAccount.deleteMany({ where: { userId } });
    await this.prisma.user.delete({ where: { id: userId } });
  }

  /**
   * Run a function within a transaction that will be rolled back
   * Useful for tests that need to test database operations but not persist changes
   */
  async withRollback<T>(fn: (prisma: any) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      const result = await fn(tx);
      
      // Force rollback by throwing a specific error
      throw new RollbackError(result);
    }).catch((error) => {
      if (error instanceof RollbackError) {
        // Return the result, rollback happened successfully
        return error.result;
      }
      throw error;
    });
  }

  /**
   * Count records in a table
   */
  async countTable(tableName: string): Promise<number> {
    const result = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}"`);
    return Number((result as any)[0].count);
  }

  /**
   * Check if database is empty
   */
  async isDatabaseEmpty(): Promise<boolean> {
    const userCount = await this.prisma.user.count();
    return userCount === 0;
  }

  /**
   * Seed basic data for tests
   */
  async seedBasicData(): Promise<SeedData> {
    // Clean existing data first
    await this.cleanAllData();

    // Create a test user
    const user = await this.prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: '$2a$04$hashed-password', // bcrypt hashed 'password123' with 4 rounds
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create a financial account
    const financialAccount = await this.prisma.financialAccount.create({
      data: {
        nome: 'Test Account',
        tipo: 'conta_corrente',
        instituicao: 'Test Bank',
        saldoInicial: 1000,
        saldoAtual: 1000,
        cor: '#0066CC',
        ativa: true,
        userId: user.id,
      },
    });

    // Create a financial category
    const financialCategory = await this.prisma.financialCategory.create({
      data: {
        nome: 'Test Category',
        icone: '🏠',
        cor: '#FF6B6B',
        tipo: 'despesa',
        ruleCategory: 'necessidades',
        ativa: true,
        userId: user.id,
      },
    });

    // Create user finance settings
    const financeSettings = await this.prisma.userFinanceSettings.create({
      data: {
        salary: 5000,
        fixed: 50,
        variable: 30,
        investments: 20,
        userId: user.id,
      },
    });

    return {
      user,
      financialAccount,
      financialCategory,
      financeSettings,
    };
  }

  /**
   * Create test data for multiple users
   */
  async seedMultiUserData(userCount: number = 3): Promise<{ users: any[], accounts: any[] }> {
    await this.cleanAllData();

    const users = [];
    const accounts = [];

    for (let i = 0; i < userCount; i++) {
      const user = await this.prisma.user.create({
        data: {
          name: `Test User ${i + 1}`,
          email: `test${i + 1}@example.com`,
          password: '$2a$04$hashed-password',
        },
      });
      users.push(user);

      const account = await this.prisma.financialAccount.create({
        data: {
          nome: `Account ${i + 1}`,
          tipo: 'conta_corrente',
          saldoInicial: 1000 * (i + 1),
          saldoAtual: 1000 * (i + 1),
          userId: user.id,
        },
      });
      accounts.push(account);
    }

    return { users, accounts };
  }

  /**
   * Wait for database operations to complete
   */
  async waitForDb(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }
}

class RollbackError extends Error {
  constructor(public result?: any) {
    super('Transaction rollback');
    this.name = 'RollbackError';
  }
}

export interface SeedData {
  user: any;
  financialAccount: any;
  financialCategory: any;
  financeSettings: any;
}

export function createDatabaseHelper(testEnv: TestEnvironment): DatabaseTestHelper {
  return new DatabaseTestHelper(testEnv.prisma);
}

export function createDatabaseHelperFromPrisma(prisma: PrismaClient): DatabaseTestHelper {
  return new DatabaseTestHelper(prisma);
}