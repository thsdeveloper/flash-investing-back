import { FinancialAccount, FinancialAccountType } from '@src/modules/financial-accounts/domain/entities/financial-account';
import { FinancialAccountRepository } from '@src/modules/financial-accounts/domain/contracts/financial-account-repository';
import { FinancialAccountResponseDto, FinancialAccountListDto } from '@src/modules/financial-accounts/application/dtos/financial-account-dtos';

export interface GetFinancialAccountsFilters {
  userId: string;
  tipo?: FinancialAccountType;
  ativa?: boolean;
}

export class GetFinancialAccountsUseCase {
  constructor(
    private readonly financialAccountRepository: FinancialAccountRepository
  ) {}

  async execute(filters: GetFinancialAccountsFilters): Promise<FinancialAccountListDto> {
    let accounts: FinancialAccount[];

    if (filters.tipo) {
      accounts = await this.financialAccountRepository.findByUserIdAndType(filters.userId, filters.tipo);
    } else if (filters.ativa === true) {
      accounts = await this.financialAccountRepository.findActiveByUserId(filters.userId);
    } else {
      accounts = await this.financialAccountRepository.findByUserId(filters.userId);
    }

    // Aplicar filtro de ativa se especificado
    if (filters.ativa !== undefined && filters.tipo) {
      accounts = accounts.filter(account => account.isAtiva() === filters.ativa);
    }

    const data = accounts.map(account => this.toResponseDto(account));

    return {
      data,
      meta: {
        total_count: data.length,
        filter_count: data.length,
      }
    };
  }

  private toResponseDto(account: FinancialAccount): FinancialAccountResponseDto {
    const id = account.getId();
    if (!id) {
      throw new Error('Financial account must have an ID');
    }
    
    return {
      id,
      nome: account.getNome(),
      tipo: account.getTipo(),
      instituicao: account.getInstituicao(),
      saldo_inicial: account.getSaldoInicial(),
      saldo_atual: account.getSaldoAtual(),
      cor: account.getCor(),
      icone: account.getIcone(),
      ativa: account.isAtiva(),
      observacoes: account.getObservacoes(),
      user: account.getUserId(),
      date_created: account.getCreatedAt().toISOString(),
      date_updated: account.getUpdatedAt().toISOString(),
    };
  }
}