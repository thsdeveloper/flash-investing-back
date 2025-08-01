import {PluggyClient} from "@src/modules/pluggy/domain/contracts/pluggy-client";
import {PluggyTransaction} from "@src/modules/pluggy/domain/entities/pluggy-transaction";

export class GetPluggyTransactionsUseCase {
  constructor(private readonly pluggyClient: PluggyClient) {}

  async execute(itemId: string, accountId?: string, from?: Date, to?: Date): Promise<PluggyTransaction[]> {
    try {
      const transactions = await this.pluggyClient.getTransactions(itemId, accountId, from, to);
      return transactions;
    } catch (error) {
      throw new Error(`Failed to get transactions: ${error}`);
    }
  }
}