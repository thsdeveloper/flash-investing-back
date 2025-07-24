import { PluggyClient, CreateItemResponse } from '../../domain/contracts/pluggy-client';

export class GetItemStatusUseCase {
  constructor(private readonly pluggyClient: PluggyClient) {}

  async execute(itemId: string): Promise<CreateItemResponse> {
    try {
      const item = await this.pluggyClient.getItem(itemId);
      return item;
    } catch (error) {
      throw new Error(`Failed to get item status: ${error}`);
    }
  }
}