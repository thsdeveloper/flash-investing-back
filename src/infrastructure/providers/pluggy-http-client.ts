import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import { PluggyClient, CreateItemRequest, CreateItemResponse, SubmitParameterRequest } from '../../domain/contracts/pluggy-client';
import { Connector } from '../../domain/entities/connector';
import { PluggyAccount } from '../../domain/entities/pluggy-account';
import { PluggyTransaction } from '../../domain/entities/pluggy-transaction';

export class PluggyHttpClient implements PluggyClient {
  private readonly httpClient: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    // Validar variáveis de ambiente
    if (!env.PLUGGY_CLIENT_ID || !env.PLUGGY_CLIENT_SECRET) {
      throw new Error('Pluggy credentials not configured. Please set PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET environment variables.');
    }

    console.log('🚀 Initializing Pluggy HTTP Client');
    console.log('📍 Base URL:', env.PLUGGY_BASE_URL);

    this.httpClient = axios.create({
      baseURL: env.PLUGGY_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    // Interceptor para adicionar token automaticamente
    this.httpClient.interceptors.request.use(
      async (config) => {
        // Skip authentication for auth endpoint
        if (config.url?.includes('/auth')) {
          return config;
        }
        
        if (!this.accessToken) {
          console.log('🔑 No access token found, authenticating...');
          await this.authenticate();
        }
        
        if (this.accessToken) {
          config.headers['X-API-KEY'] = this.accessToken;
          console.log('🎫 Added X-API-KEY header to request');
        } else {
          console.error('❌ No access token available after authentication');
        }
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para logging de erros
    this.httpClient.interceptors.response.use(
      response => response,
      async (error) => {
        console.error('Pluggy API Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
        });

        // Se for erro 401, tentar reautenticar
        if (error.response?.status === 401) {
          try {
            await this.authenticate();
            // Retry a requisição original
            const config = error.config;
            config.headers.Authorization = `Bearer ${this.accessToken}`;
            return this.httpClient(config);
          } catch (authError) {
            console.error('Re-authentication failed:', authError);
            throw error;
          }
        }

        throw error;
      }
    );
  }

  private async authenticate(): Promise<void> {
    try {
      console.log('🔐 Attempting Pluggy authentication...');
      console.log('🔑 Client ID (length):', env.PLUGGY_CLIENT_ID?.length || 0);
      console.log('🔑 Client Secret (length):', env.PLUGGY_CLIENT_SECRET?.length || 0);
      console.log('🌐 Base URL:', env.PLUGGY_BASE_URL);
      
      const authPayload = {
        clientId: env.PLUGGY_CLIENT_ID,
        clientSecret: env.PLUGGY_CLIENT_SECRET,
      };
      
      console.log('📤 Sending auth request to:', `${env.PLUGGY_BASE_URL}/auth`);
      
      // Use axios diretamente para evitar interceptors
      const authResponse = await axios.post(
        `${env.PLUGGY_BASE_URL}/auth`,
        authPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
          validateStatus: (status) => status < 500, // Aceitar 4xx para debug
        }
      );

      console.log('📥 Auth response status:', authResponse.status);
      console.log('📥 Auth response data:', authResponse.data);

      if (authResponse.status === 200 && authResponse.data && authResponse.data.apiKey) {
        this.accessToken = authResponse.data.apiKey;
        console.log('✅ Pluggy authentication successful');
        console.log('🎫 Token received (first 30 chars):', this.accessToken?.substring(0, 30) + '...');
      } else {
        throw new Error(`Authentication failed: ${JSON.stringify(authResponse.data)}`);
      }
    } catch (error: any) {
      console.error('❌ Pluggy authentication failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        clientIdLength: env.PLUGGY_CLIENT_ID?.length,
        clientSecretLength: env.PLUGGY_CLIENT_SECRET?.length,
        url: `${env.PLUGGY_BASE_URL}/auth`
      });
      throw new Error('Failed to authenticate with Pluggy API');
    }
  }

  async getConnectors(sandbox: boolean = false): Promise<Connector[]> {
    try {
      console.log('📡 Fetching Pluggy connectors...');
      
      // Garantir autenticação antes de fazer a requisição
      if (!this.accessToken) {
        console.log('🔐 No token available, authenticating first...');
        await this.authenticate();
      }
      
      // Fazer requisição diretamente com o token
      const response = await axios.get(`${env.PLUGGY_BASE_URL}/connectors`, {
        params: { 
          sandbox,
          pageSize: 500 // Aumentar para pegar mais conectores
        },
        headers: {
          'X-API-KEY': this.accessToken,
          'Accept': 'application/json',
        },
        timeout: 30000,
      });

      console.log(`✅ Fetched ${response.data.results?.length || 0} connectors from Pluggy API`);

      // Se não configurado corretamente, pode retornar dados mock para desenvolvimento
      if (!response.data || !response.data.results) {
        console.warn('Pluggy API returned empty data. Using mock connectors for development.');
        return this.getMockConnectors();
      }

      return response.data.results.map((connector: any) =>
        Connector.fromPluggyData(connector)
      );
    } catch (error: any) {
      console.error('❌ Error fetching connectors:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        hasToken: !!this.accessToken,
        tokenPreview: this.accessToken ? this.accessToken.substring(0, 20) + '...' : 'none'
      });
      
      // Se for erro de autenticação (401, 403), retornar dados mock em desenvolvimento
      if (env.NODE_ENV === 'development' && (error.response?.status === 401 || error.response?.status === 403)) {
        console.warn('Pluggy authentication failed. Using mock connectors for development.');
        return this.getMockConnectors();
      }
      
      throw new Error(`Failed to fetch connectors: ${error.message || error}`);
    }
  }

  async createItem(request: CreateItemRequest): Promise<CreateItemResponse> {
    try {
      // Garantir autenticação
      if (!this.accessToken) {
        await this.authenticate();
      }

      const response = await axios.post(`${env.PLUGGY_BASE_URL}/items`, {
        connectorId: request.connectorId,
        parameters: request.parameters,
        clientUserId: request.clientUserId,
      }, {
        headers: {
          'X-API-KEY': this.accessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000,
      });

      return {
        id: response.data.id,
        connector: response.data.connector,
        status: response.data.status,
        executionStatus: response.data.executionStatus,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
        lastUpdatedAt: response.data.lastUpdatedAt ? new Date(response.data.lastUpdatedAt) : undefined,
        webhookUrl: response.data.webhookUrl,
        clientUserId: response.data.clientUserId,
        consecutiveFailedUpdates: response.data.consecutiveFailedUpdates,
        userAction: response.data.userAction,
        parameter: response.data.parameter,
      };
    } catch (error) {
      throw new Error(`Failed to create item: ${error}`);
    }
  }

  async getAccounts(itemId: string): Promise<PluggyAccount[]> {
    try {
      // Garantir autenticação
      if (!this.accessToken) {
        await this.authenticate();
      }

      const response = await axios.get(`${env.PLUGGY_BASE_URL}/accounts`, {
        params: { itemId },
        headers: {
          'X-API-KEY': this.accessToken,
          'Accept': 'application/json',
        },
        timeout: 30000,
      });

      return response.data.results.map((account: any) =>
        PluggyAccount.fromPluggyData(account)
      );
    } catch (error) {
      throw new Error(`Failed to fetch accounts: ${error}`);
    }
  }

  async getTransactions(itemId: string, accountId?: string, from?: Date, to?: Date): Promise<PluggyTransaction[]> {
    try {
      // Garantir autenticação
      if (!this.accessToken) {
        await this.authenticate();
      }

      const params: any = {
        itemId,
        pageSize: 500,
      };

      if (accountId) {
        params.accountId = accountId;
      }

      if (from) {
        params.from = from.toISOString();
      }

      if (to) {
        params.to = to.toISOString();
      }

      const response = await axios.get(`${env.PLUGGY_BASE_URL}/transactions`, {
        params,
        headers: {
          'X-API-KEY': this.accessToken,
          'Accept': 'application/json',
        },
        timeout: 30000,
      });

      return response.data.results.map((transaction: any) =>
        PluggyTransaction.fromPluggyData(transaction)
      );
    } catch (error) {
      throw new Error(`Failed to fetch transactions: ${error}`);
    }
  }

  async refreshItem(itemId: string): Promise<void> {
    try {
      // Garantir autenticação
      if (!this.accessToken) {
        await this.authenticate();
      }

      await axios.post(`${env.PLUGGY_BASE_URL}/items/${itemId}/refresh`, {}, {
        headers: {
          'X-API-KEY': this.accessToken,
          'Accept': 'application/json',
        },
        timeout: 30000,
      });
    } catch (error) {
      throw new Error(`Failed to refresh item: ${error}`);
    }
  }

  async deleteItem(itemId: string): Promise<void> {
    try {
      // Garantir autenticação
      if (!this.accessToken) {
        await this.authenticate();
      }

      await axios.delete(`${env.PLUGGY_BASE_URL}/items/${itemId}`, {
        headers: {
          'X-API-KEY': this.accessToken,
          'Accept': 'application/json',
        },
        timeout: 30000,
      });
    } catch (error) {
      throw new Error(`Failed to delete item: ${error}`);
    }
  }

  async getItem(itemId: string): Promise<CreateItemResponse> {
    try {
      // Garantir autenticação
      if (!this.accessToken) {
        await this.authenticate();
      }

      const response = await axios.get(`${env.PLUGGY_BASE_URL}/items/${itemId}`, {
        headers: {
          'X-API-KEY': this.accessToken,
          'Accept': 'application/json',
        },
        timeout: 30000,
      });

      return {
        id: response.data.id,
        connector: response.data.connector,
        status: response.data.status,
        executionStatus: response.data.executionStatus,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
        lastUpdatedAt: response.data.lastUpdatedAt ? new Date(response.data.lastUpdatedAt) : undefined,
        webhookUrl: response.data.webhookUrl,
        clientUserId: response.data.clientUserId,
        consecutiveFailedUpdates: response.data.consecutiveFailedUpdates,
        userAction: response.data.userAction,
        parameter: response.data.parameter,
      };
    } catch (error) {
      throw new Error(`Failed to get item: ${error}`);
    }
  }

  async submitParameter(request: SubmitParameterRequest): Promise<CreateItemResponse> {
    try {
      // Garantir autenticação
      if (!this.accessToken) {
        await this.authenticate();
      }

      const response = await axios.patch(`${env.PLUGGY_BASE_URL}/items/${request.itemId}`, {
        parameters: request.parameters,
      }, {
        headers: {
          'X-API-KEY': this.accessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000,
      });

      return {
        id: response.data.id,
        connector: response.data.connector,
        status: response.data.status,
        executionStatus: response.data.executionStatus,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
        lastUpdatedAt: response.data.lastUpdatedAt ? new Date(response.data.lastUpdatedAt) : undefined,
        webhookUrl: response.data.webhookUrl,
        clientUserId: response.data.clientUserId,
        consecutiveFailedUpdates: response.data.consecutiveFailedUpdates,
        userAction: response.data.userAction,
        parameter: response.data.parameter,
      };
    } catch (error) {
      throw new Error(`Failed to submit parameter: ${error}`);
    }
  }

  private getMockConnectors(): Connector[] {
    // Dados mock para desenvolvimento quando Pluggy não está configurado
    const mockData = [
      {
        id: 201,
        name: 'Itaú',
        institutionUrl: 'https://www.itau.com.br',
        imageUrl: 'https://res.cloudinary.com/dqvlntu2k/image/upload/v1/connectors/itau.png',
        primaryColor: '#EC7000',
        type: 'PERSONAL_BANK',
        country: 'BR',
        credentials: [
          {
            label: 'Agência',
            name: 'agency',
            type: 'number',
            placeholder: '1234',
            validation: 'required',
            validationMessage: 'Agência é obrigatória',
            optional: false,
          },
          {
            label: 'Conta',
            name: 'account',
            type: 'number',
            placeholder: '12345-6',
            validation: 'required',
            validationMessage: 'Conta é obrigatória',
            optional: false,
          },
          {
            label: 'Senha',
            name: 'password',
            type: 'password',
            placeholder: 'Digite sua senha',
            validation: 'required',
            validationMessage: 'Senha é obrigatória',
            optional: false,
          }
        ],
        products: ['ACCOUNTS', 'TRANSACTIONS'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 202,
        name: 'Banco do Brasil',
        institutionUrl: 'https://www.bb.com.br',
        imageUrl: 'https://res.cloudinary.com/dqvlntu2k/image/upload/v1/connectors/bb.png',
        primaryColor: '#FFFF00',
        type: 'PERSONAL_BANK',
        country: 'BR',
        credentials: [
          {
            label: 'Agência',
            name: 'agency',
            type: 'number',
            placeholder: '1234-5',
            validation: 'required',
            validationMessage: 'Agência é obrigatória',
            optional: false,
          },
          {
            label: 'Conta',
            name: 'account',
            type: 'number',
            placeholder: '12345-6',
            validation: 'required',
            validationMessage: 'Conta é obrigatória',
            optional: false,
          },
          {
            label: 'Senha',
            name: 'password',
            type: 'password',
            placeholder: 'Digite sua senha',
            validation: 'required',
            validationMessage: 'Senha é obrigatória',
            optional: false,
          }
        ],
        products: ['ACCOUNTS', 'TRANSACTIONS'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 203,
        name: 'Bradesco',
        institutionUrl: 'https://www.bradesco.com.br',
        imageUrl: 'https://res.cloudinary.com/dqvlntu2k/image/upload/v1/connectors/bradesco.png',
        primaryColor: '#CC092F',
        type: 'PERSONAL_BANK',
        country: 'BR',
        credentials: [
          {
            label: 'Agência',
            name: 'agency',
            type: 'number',
            placeholder: '1234',
            validation: 'required',
            validationMessage: 'Agência é obrigatória',
            optional: false,
          },
          {
            label: 'Conta',
            name: 'account',
            type: 'number',
            placeholder: '1234567-8',
            validation: 'required',
            validationMessage: 'Conta é obrigatória',
            optional: false,
          },
          {
            label: 'Senha',
            name: 'password',
            type: 'password',
            placeholder: 'Digite sua senha',
            validation: 'required',
            validationMessage: 'Senha é obrigatória',
            optional: false,
          }
        ],
        products: ['ACCOUNTS', 'TRANSACTIONS'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 204,
        name: 'Nubank',
        institutionUrl: 'https://www.nubank.com.br',
        imageUrl: 'https://res.cloudinary.com/dqvlntu2k/image/upload/v1/connectors/nubank.png',
        primaryColor: '#8A05BE',
        type: 'PERSONAL_BANK',
        country: 'BR',
        credentials: [
          {
            label: 'CPF',
            name: 'cpf',
            type: 'text',
            placeholder: '000.000.000-00',
            validation: 'required',
            validationMessage: 'CPF é obrigatório',
            optional: false,
          },
          {
            label: 'Senha',
            name: 'password',
            type: 'password',
            placeholder: 'Digite sua senha',
            validation: 'required',
            validationMessage: 'Senha é obrigatória',
            optional: false,
          }
        ],
        products: ['ACCOUNTS', 'TRANSACTIONS', 'CREDIT_CARDS'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    return mockData.map(data => Connector.fromPluggyData(data));
  }
}