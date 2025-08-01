import { FinancialAccount } from '@src/modules/financial-accounts/domain/entities/financial-account';
import { FinancialAccountRepository } from '@src/modules/financial-accounts/domain/contracts/financial-account-repository';
import { UpdateFinancialAccountDto, FinancialAccountResponseDto } from '@src/modules/financial-accounts/application/dtos/financial-account-dtos';
import { DomainError } from '@src/modules/shared/domain/errors/domain-error';

export class UpdateFinancialAccountUseCase {
  constructor(
    private readonly financialAccountRepository: FinancialAccountRepository
  ) {}

  async execute(id: string, dto: UpdateFinancialAccountDto, userId: string): Promise<FinancialAccountResponseDto> {
    const account = await this.financialAccountRepository.findById(id);
    
    if (!account) {
      throw new DomainError('Conta financeira não encontrada', 'FINANCIAL_ACCOUNT_NOT_FOUND');
    }

    // Verificar se a conta pertence ao usuário
    if (account.getUserId() !== userId) {
      throw new DomainError('Não autorizado a modificar esta conta', 'UNAUTHORIZED');
    }

    // Aplicar atualizações
    if (dto.nome !== undefined) {
      account.updateNome(dto.nome);
    }

    if (dto.tipo !== undefined) {
      account.updateTipo(dto.tipo);
    }

    if (dto.instituicao !== undefined) {
      account.updateInstituicao(dto.instituicao);
    }

    if (dto.saldoAtual !== undefined) {
      account.updateSaldo(dto.saldoAtual);
    }

    if (dto.cor !== undefined) {
      account.updateCor(dto.cor);
    }

    if (dto.icone !== undefined) {
      account.updateIcone(dto.icone);
    }

    if (dto.ativa !== undefined) {
      if (dto.ativa) {
        account.ativar();
      } else {
        account.desativar();
      }
    }

    if (dto.observacoes !== undefined) {
      account.updateObservacoes(dto.observacoes);
    }

    const updatedAccount = await this.financialAccountRepository.update(account);

    return this.toResponseDto(updatedAccount);
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