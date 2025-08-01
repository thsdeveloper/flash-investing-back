import {CreditCardRepository} from "@src/modules/credit-cards/domain/contracts/credit-card-repository";
import {CreditCardResponseDto, CreditCardUsageDto} from "@src/modules/credit-cards/application/dtos/credit-card-dtos";
import {CreditCard} from "@src/modules/credit-cards/domain/entities/credit-card";

export class GetCreditCardsUseCase {
  constructor(private creditCardRepository: CreditCardRepository) {}

  async execute(userId: string): Promise<CreditCardResponseDto[]> {
    const creditCards = await this.creditCardRepository.findByUserId(userId);
    return creditCards.map(card => this.mapToResponseDto(card));
  }

  async getActiveCards(userId: string): Promise<CreditCardResponseDto[]> {
    const creditCards = await this.creditCardRepository.findActiveByUserId(userId);
    return creditCards.map(card => this.mapToResponseDto(card));
  }

  async getUsageSummary(userId: string): Promise<CreditCardUsageDto> {
    const creditCards = await this.creditCardRepository.findByUserId(userId);
    
    const totalCards = creditCards.length;
    const totalLimit = creditCards.reduce((sum, card) => sum + card.getLimiteTotal(), 0);
    const totalUsed = creditCards.reduce((sum, card) => sum + card.getValorUtilizado(), 0);
    const totalAvailable = creditCards.reduce((sum, card) => sum + card.getLimiteDisponivel(), 0);
    
    const averageUsagePercentage = totalCards > 0 
      ? creditCards.reduce((sum, card) => sum + card.getPercentualUso(), 0) / totalCards 
      : 0;
    
    const cardsNearLimit = creditCards.filter(card => card.getPercentualUso() > 80).length;
    const inactiveCards = creditCards.filter(card => !card.isAtivo()).length;

    return {
      totalCards,
      totalLimit,
      totalUsed,
      totalAvailable,
      averageUsagePercentage,
      cardsNearLimit,
      inactiveCards
    };
  }

  private mapToResponseDto(creditCard: CreditCard): CreditCardResponseDto {
    return {
      id: creditCard.getId()!,
      nome: creditCard.getNome(),
      bandeira: creditCard.getBandeira(),
      ultimosDigitos: creditCard.getUltimosDigitos(),
      limiteTotal: creditCard.getLimiteTotal(),
      limiteDisponivel: creditCard.getLimiteDisponivel(),
      diaVencimento: creditCard.getDiaVencimento(),
      diaFechamento: creditCard.getDiaFechamento(),
      banco: creditCard.getBanco(),
      cor: creditCard.getCor(),
      ativo: creditCard.isAtivo(),
      observacoes: creditCard.getObservacoes(),
      percentualUso: creditCard.getPercentualUso(),
      valorUtilizado: creditCard.getValorUtilizado(),
      melhorDiaCompra: creditCard.getMelhorDiaCompra(),
      prazoMaximoPagamento: creditCard.getPrazoMaximoPagamento(),
      createdAt: creditCard.getCreatedAt().toISOString(),
      updatedAt: creditCard.getUpdatedAt().toISOString(),
    };
  }
}