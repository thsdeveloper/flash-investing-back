import { PluggyClient, CreateItemRequest, CreateItemResponse } from '../../domain/contracts/pluggy-client';

export class CreateItemUseCase {
  constructor(private readonly pluggyClient: PluggyClient) {}

  async execute(request: CreateItemRequest): Promise<CreateItemResponse> {
    try {
      const item = await this.pluggyClient.createItem(request);
      return item;
    } catch (error) {
      throw new Error(`Failed to create item: ${error}`);
    }
  }
}