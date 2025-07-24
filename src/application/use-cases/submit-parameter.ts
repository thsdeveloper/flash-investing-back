import { PluggyClient, SubmitParameterRequest, CreateItemResponse } from '../../domain/contracts/pluggy-client';

export class SubmitParameterUseCase {
  constructor(private readonly pluggyClient: PluggyClient) {}

  async execute(request: SubmitParameterRequest): Promise<CreateItemResponse> {
    try {
      const item = await this.pluggyClient.submitParameter(request);
      return item;
    } catch (error) {
      throw new Error(`Failed to submit parameter: ${error}`);
    }
  }
}