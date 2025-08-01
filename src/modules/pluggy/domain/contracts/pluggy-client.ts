import { Connector } from '../entities/connector';
import { PluggyAccount } from '../entities/pluggy-account';
import { PluggyTransaction } from '../entities/pluggy-transaction';

export interface CreateItemRequest {
  connectorId: number;
  parameters: Record<string, string>;
  clientUserId?: string;
}

export interface CreateItemResponse {
  id: string;
  connector: {
    id: number;
    name: string;
    institutionUrl: string;
    imageUrl: string;
    primaryColor: string;
  };
  status: string;
  executionStatus: string;
  createdAt: Date;
  updatedAt: Date;
  lastUpdatedAt?: Date;
  webhookUrl?: string;
  clientUserId?: string;
  consecutiveFailedUpdates?: number;
  userAction?: string;
  parameter?: string;
}

export interface SubmitParameterRequest {
  itemId: string;
  parameters: Record<string, string>;
}

export interface PluggyClient {
  getConnectors(sandbox?: boolean): Promise<Connector[]>;
  createItem(request: CreateItemRequest): Promise<CreateItemResponse>;
  getItem(itemId: string): Promise<CreateItemResponse>;
  submitParameter(request: SubmitParameterRequest): Promise<CreateItemResponse>;
  getAccounts(itemId: string): Promise<PluggyAccount[]>;
  getTransactions(itemId: string, accountId?: string, from?: Date, to?: Date): Promise<PluggyTransaction[]>;
  refreshItem(itemId: string): Promise<void>;
  deleteItem(itemId: string): Promise<void>;
}