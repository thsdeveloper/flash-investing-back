import {CreditCardRepository} from "@src/modules/credit-cards/domain/contracts/credit-card-repository";

export class DeleteCreditCardUseCase {
  constructor(private creditCardRepository: CreditCardRepository) {}

  async execute(userId: string, cardId: string): Promise<void> {
    const existingCard = await this.creditCardRepository.findById(cardId);

    if (!existingCard) {
      throw new Error('Cartão de crédito não encontrado');
    }

    if (existingCard.getUserId() !== userId) {
      throw new Error('Acesso não autorizado a este cartão');
    }

    // Verificar se o cartão tem faturas ou transações pendentes
    // Aqui poderia adicionar validações adicionais se necessário
    
    await this.creditCardRepository.delete(cardId);
  }
}