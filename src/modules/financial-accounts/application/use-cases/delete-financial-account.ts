import { FinancialAccountRepository } from '@src/modules/financial-accounts/domain/contracts/financial-account-repository';
import { TransactionRepository } from '@src/modules/transactions/domain/contracts/transaction-repository';
import { CreditCardRepository } from '@src/modules/credit-cards/domain/contracts/credit-card-repository';
import { DomainError } from '@src/modules/shared/domain/errors/domain-error';

export class DeleteFinancialAccountUseCase {
  constructor(
    private readonly financialAccountRepository: FinancialAccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly creditCardRepository: CreditCardRepository
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

    // Verificar integridade referencial antes da exclusão
    await this.checkReferentialIntegrity(id);

    if (softDelete) {
      // Soft delete - apenas desativa a conta
      await this.financialAccountRepository.softDelete(id);
    } else {
      // Hard delete - remove completamente
      await this.financialAccountRepository.delete(id);
    }
  }

  private async checkReferentialIntegrity(accountId: string): Promise<void> {
    // Verificar transações vinculadas
    const transactionCount = await this.transactionRepository.countByAccountId(accountId);
    if (transactionCount > 0) {
      throw new DomainError(
        `Não é possível excluir a conta. Existem ${transactionCount} transação(ões) vinculada(s) a esta conta.`,
        'ACCOUNT_HAS_TRANSACTIONS'
      );
    }

    // Verificar cartões de crédito vinculados
    const creditCardCount = await this.creditCardRepository.countByFinancialAccountId(accountId);
    if (creditCardCount > 0) {
      throw new DomainError(
        `Não é possível excluir a conta. Existem ${creditCardCount} cartão(ões) de crédito vinculado(s) a esta conta.`,
        'ACCOUNT_HAS_CREDIT_CARDS'
      );
    }

    // Note: AccountTransfer usa onDelete: Cascade no schema, então será removido automaticamente
    // Se houver necessidade de validar transferências, pode ser adicionado aqui
  }
}