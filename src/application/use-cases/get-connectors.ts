import { PluggyClient } from '../../domain/contracts/pluggy-client';
import { Connector } from '../../domain/entities/connector';

export class GetConnectorsUseCase {
  constructor(private readonly pluggyClient: PluggyClient) {}

  async execute(sandbox: boolean = false): Promise<Connector[]> {
    try {
      const connectors = await this.pluggyClient.getConnectors(sandbox);
      return connectors;
    } catch (error) {
      throw new Error(`Failed to get connectors: ${error}`);
    }
  }
}