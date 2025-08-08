import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { getTestEnv } from '../helpers/test-env';

export interface CreateUserData {
  name?: string;
  email?: string;
  password?: string;
}

export interface UserFactoryResult {
  id: string;
  name: string;
  email: string;
  password: string; // plain text password for testing
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserFactory {
  private static counter = 0;
  private env = getTestEnv();

  constructor(private prisma: PrismaClient) {}

  /**
   * Create a single user with optional overrides
   */
  async create(data: CreateUserData = {}): Promise<UserFactoryResult> {
    UserFactory.counter++;
    
    const plainPassword = data.password || 'password123';
    const hashedPassword = await bcrypt.hash(plainPassword, this.env.BCRYPT_ROUNDS);
    
    const userData = {
      name: data.name || `Test User ${UserFactory.counter}`,
      email: data.email || `test${UserFactory.counter}-${Date.now()}@example.com`,
      password: hashedPassword,
    };

    const user = await this.prisma.user.create({
      data: userData,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: plainPassword,
      hashedPassword: hashedPassword,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Create multiple users
   */
  async createMany(count: number, baseData: CreateUserData = {}): Promise<UserFactoryResult[]> {
    const users: UserFactoryResult[] = [];
    
    for (let i = 0; i < count; i++) {
      const user = await this.create({
        ...baseData,
        name: baseData.name ? `${baseData.name} ${i + 1}` : undefined,
        email: baseData.email ? 
          baseData.email.replace('@', `${i + 1}@`) : 
          undefined,
      });
      users.push(user);
    }

    return users;
  }

  /**
   * Create user with specific email domain
   */
  async createWithDomain(domain: string = 'testdomain.com', data: CreateUserData = {}): Promise<UserFactoryResult> {
    UserFactory.counter++;
    
    const email = data.email || `test${UserFactory.counter}@${domain}`;
    
    return this.create({
      ...data,
      email,
    });
  }

  /**
   * Create admin user (if your system has admin roles)
   */
  async createAdmin(data: CreateUserData = {}): Promise<UserFactoryResult> {
    return this.create({
      name: 'Admin User',
      email: `admin-${Date.now()}@example.com`,
      ...data,
    });
  }

  /**
   * Create user with financial accounts
   */
  async createWithFinancialAccounts(userData: CreateUserData = {}): Promise<{
    user: UserFactoryResult;
    accounts: any[];
  }> {
    const user = await this.create(userData);
    
    const accounts = await Promise.all([
      this.prisma.financialAccount.create({
        data: {
          nome: 'Conta Corrente Principal',
          tipo: 'conta_corrente',
          instituicao: 'Banco do Brasil',
          saldoInicial: 1000,
          saldoAtual: 1000,
          cor: '#0066CC',
          ativa: true,
          userId: user.id,
        },
      }),
      this.prisma.financialAccount.create({
        data: {
          nome: 'Carteira Digital',
          tipo: 'carteira',
          saldoInicial: 500,
          saldoAtual: 500,
          cor: '#FF6B6B',
          ativa: true,
          userId: user.id,
        },
      }),
    ]);

    return { user, accounts };
  }

  /**
   * Create user with complete finance setup
   */
  async createWithCompleteFinanceSetup(userData: CreateUserData = {}): Promise<{
    user: UserFactoryResult;
    accounts: any[];
    categories: any[];
    settings: any;
  }> {
    const { user, accounts } = await this.createWithFinancialAccounts(userData);
    
    // Create financial categories
    const categories = await Promise.all([
      this.prisma.financialCategory.create({
        data: {
          nome: 'Alimentação',
          icone: '🍔',
          cor: '#FF6B6B',
          tipo: 'despesa',
          ruleCategory: 'necessidades',
          ativa: true,
          userId: user.id,
        },
      }),
      this.prisma.financialCategory.create({
        data: {
          nome: 'Entretenimento',
          icone: '🎬',
          cor: '#4ECDC4',
          tipo: 'despesa',
          ruleCategory: 'desejos',
          ativa: true,
          userId: user.id,
        },
      }),
      this.prisma.financialCategory.create({
        data: {
          nome: 'Salário',
          icone: '💰',
          cor: '#45B7D1',
          tipo: 'receita',
          ruleCategory: 'necessidades',
          ativa: true,
          userId: user.id,
        },
      }),
    ]);

    // Create user finance settings
    const settings = await this.prisma.userFinanceSettings.create({
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
      accounts,
      categories,
      settings,
    };
  }

  /**
   * Reset the counter (useful for tests that need predictable names)
   */
  static resetCounter(): void {
    UserFactory.counter = 0;
  }
}

/**
 * Helper function to create a user factory
 */
export function createUserFactory(prisma: PrismaClient): UserFactory {
  return new UserFactory(prisma);
}