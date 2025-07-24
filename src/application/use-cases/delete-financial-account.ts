import { FinancialAccountRepository } from '../../domain/contracts/financial-account-repository';
import { DomainError } from '../../domain/errors/domain-error';

export class DeleteFinancialAccountUseCase {
  constructor(
    private readonly financialAccountRepository: FinancialAccountRepository
  ) {}

  async execute(id: string, userId: string, softDelete: boolean = true): Promise<void> {
    const account = await this.financialAccountRepository.findById(id);
    
    if (!account) {
      throw new DomainError('Conta financeira não encontrada', 'FINANCIAL_ACCOUNT_NOT_FOUND');
    }

    // Verificar se a conta pertence ao usuário
    if (account.getUserId() !== userId) {
      throw new DomainError('Não autorizado a deletar esta conta', 'UNAUTHORIZED');
    }

    if (softDelete) {
      // Soft delete - apenas desativa a conta
      await this.financialAccountRepository.softDelete(id);
    } else {
      // Hard delete - remove completamente
      await this.financialAccountRepository.delete(id);
    }
  }
}