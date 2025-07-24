import { PluggyClient } from '../../domain/contracts/pluggy-client';
import { PluggyAccount } from '../../domain/entities/pluggy-account';

export class GetPluggyAccountsUseCase {
  constructor(private readonly pluggyClient: PluggyClient) {}

  async execute(itemId: string): Promise<PluggyAccount[]> {
    try {
      const accounts = await this.pluggyClient.getAccounts(itemId);
      return accounts;
    } catch (error) {
      throw new Error(`Failed to get accounts: ${error}`);
    }
  }
}