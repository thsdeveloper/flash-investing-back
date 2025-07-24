import { CreditCardTransactionRepository } from '../../domain/contracts/credit-card-transaction-repository';

export class DeleteCreditCardTransactionUseCase {
  constructor(
    private readonly creditCardTransactionRepository: CreditCardTransactionRepository
  ) {}

  async execute(userId: string, transactionId: string): Promise<void> {
    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await this.creditCardTransactionRepository.findByUserIdAndId(userId, transactionId);
    if (!existingTransaction) {
      throw new Error('Transação de cartão de crédito não encontrada');
    }

    // Deletar a transação
    await this.creditCardTransactionRepository.delete(transactionId);
  }
}