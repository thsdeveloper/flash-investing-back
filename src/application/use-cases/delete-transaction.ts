import { TransactionRepository } from '../../domain/contracts/transaction-repository';
import { FinancialAccountRepository } from '../../domain/contracts/financial-account-repository';
import { PrismaClient } from '@prisma/client';

export interface DeleteTransactionDto {
  id: string;
  userId: string;
}

export class DeleteTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly financialAccountRepository: FinancialAccountRepository,
    private readonly prisma: PrismaClient
  ) {}

  async execute(dto: DeleteTransactionDto): Promise<void> {
    // Usar transação do banco de dados para garantir consistência
    return await this.prisma.$transaction(async (prismaTransaction) => {
      // Buscar a transação atual
      const transaction = await this.transactionRepository.findById(dto.id);
      if (!transaction) {
        throw new Error('Transação não encontrada');
      }

      // Verificar se a transação pertence ao usuário
      if (!transaction.belongsToUser(dto.userId)) {
        throw new Error('Transação não pertence ao usuário');
      }

      // Reverter o efeito da transação no saldo da conta
      const contaFinanceiraId = transaction.getContaFinanceiraId();
      if (contaFinanceiraId) {
        const account = await this.financialAccountRepository.findByUserIdAndId(dto.userId, contaFinanceiraId);
        if (account) {
          if (transaction.isReceita()) {
            account.subtrairValor(transaction.getValor());
          } else if (transaction.isDespesa()) {
            account.adicionarValor(transaction.getValor());
          }
          await this.financialAccountRepository.update(account);
        }
      }

      // Deletar a transação
      await this.transactionRepository.delete(dto.id);
    });
  }
}