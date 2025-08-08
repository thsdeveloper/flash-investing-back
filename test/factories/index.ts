import { PrismaClient } from '@prisma/client';

export * from './user-factory';
export * from './transaction-factory';
export * from './financial-account-factory';

import { UserFactory } from './user-factory';
import { TransactionFactory } from './transaction-factory';
import { FinancialAccountFactory } from './financial-account-factory';

/**
 * Factory collection for easy access to all factories
 */
export class FactoryCollection {
  public readonly user: UserFactory;
  public readonly transaction: TransactionFactory;
  public readonly financialAccount: FinancialAccountFactory;

  constructor(prisma: PrismaClient) {
    this.user = new UserFactory(prisma);
    this.transaction = new TransactionFactory(prisma);
    this.financialAccount = new FinancialAccountFactory(prisma);
  }

  /**
   * Reset all factory counters
   */
  resetAllCounters(): void {
    UserFactory.resetCounter();
    TransactionFactory.resetCounter();
    FinancialAccountFactory.resetCounter();
  }
}

/**
 * Create a collection of all factories
 */
export function createFactories(prisma: PrismaClient): FactoryCollection {
  return new FactoryCollection(prisma);
}