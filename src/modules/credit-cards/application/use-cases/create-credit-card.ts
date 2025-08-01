import { CreateCreditCardDto, CreditCardResponseDto } from '../dtos/credit-card-dtos';
import {CreditCardRepository} from "@src/modules/credit-cards/domain/contracts/credit-card-repository";
import {
  FinancialAccountRepository
} from "@src/modules/financial-accounts/domain/contracts/financial-account-repository";
import {CreditCard} from "@src/modules/credit-cards/domain/entities/credit-card";

export class CreateCreditCardUseCase {
  constructor(
    private creditCardRepository: CreditCardRepository,
    private financialAccountRepository: FinancialAccountRepository
  ) {}

  async execute(userId: string, dto: CreateCreditCardDto): Promise<CreditCardResponseDto> {
    // Verificar se a conta financeira existe e pertence ao usuário
    const financialAccount = await this.financialAccountRepository.findById(dto.contaFinanceiraId);
    
    if (!financialAccount) {
      throw new Error('Conta financeira não encontrada');
    }

    if (financialAccount.getUserId() !== userId) {
      throw new Error('Conta financeira não pertence ao usuário');
    }

    if (!financialAccount.isAtiva()) {
      throw new Error('Conta financeira está inativa');
    }

    // Verificar se já existe um cartão com os mesmos últimos dígitos
    const existingCards = await this.creditCardRepository.findByUserIdAndLastDigits(
      userId, 
      dto.ultimosDigitos
    );

    if (existingCards.length > 0) {
      const existingCard = existingCards.find(card => 
        card.getBandeira() === dto.bandeira && 
        card.getBanco() === dto.banco
      );

      if (existingCard) {
        throw new Error('Já existe um cartão com estes últimos dígitos para esta bandeira e banco');
      }
    }

    const creditCard = new CreditCard({
      ...dto,
      userId,
    });

    const savedCard = await this.creditCardRepository.create(creditCard);

    return this.mapToResponseDto(savedCard);
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