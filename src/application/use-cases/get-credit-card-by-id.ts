import { CreditCard } from '../../domain/entities/credit-card';
import { CreditCardRepository } from '../../domain/contracts/credit-card-repository';
import { CreditCardResponseDto } from '../dtos/credit-card-dtos';

export class GetCreditCardByIdUseCase {
  constructor(private creditCardRepository: CreditCardRepository) {}

  async execute(userId: string, cardId: string): Promise<CreditCardResponseDto> {
    const creditCard = await this.creditCardRepository.findById(cardId);

    if (!creditCard) {
      throw new Error('Cartão de crédito não encontrado');
    }

    if (creditCard.getUserId() !== userId) {
      throw new Error('Acesso não autorizado a este cartão');
    }

    return this.mapToResponseDto(creditCard);
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