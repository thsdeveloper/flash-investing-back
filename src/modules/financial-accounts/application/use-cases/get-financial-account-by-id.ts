import { FinancialAccount } from '@src/modules/financial-accounts/domain/entities/financial-account';
import { FinancialAccountRepository } from '@src/modules/financial-accounts/domain/contracts/financial-account-repository';
import { FinancialAccountResponseDto } from '@src/modules/financial-accounts/application/dtos/financial-account-dtos';
import { DomainError } from '@src/modules/shared/domain/errors/domain-error';

export class GetFinancialAccountByIdUseCase {
  constructor(
    private readonly financialAccountRepository: FinancialAccountRepository
  ) {}

  async execute(id: string, userId: string): Promise<FinancialAccountResponseDto> {
    const account = await this.financialAccountRepository.findById(id);
    
    if (!account) {
      throw new DomainError('Conta financeira não encontrada', 'FINANCIAL_ACCOUNT_NOT_FOUND');
    }

    // Verificar se a conta pertence ao usuário
    if (account.getUserId() !== userId) {
      throw new DomainError('Não autorizado a acessar esta conta', 'UNAUTHORIZED');
    }

    return this.toResponseDto(account);
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