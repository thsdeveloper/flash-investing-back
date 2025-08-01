import { UpdateCreditCardDto, CreditCardResponseDto } from '../dtos/credit-card-dtos';
import {CreditCardRepository} from "@src/modules/credit-cards/domain/contracts/credit-card-repository";
import {
  FinancialAccountRepository
} from "@src/modules/financial-accounts/domain/contracts/financial-account-repository";
import {CreditCard} from "@src/modules/credit-cards/domain/entities/credit-card";

export class UpdateCreditCardUseCase {
  constructor(
    private creditCardRepository: CreditCardRepository,
    private financialAccountRepository: FinancialAccountRepository
  ) {}

  async execute(userId: string, cardId: string, dto: UpdateCreditCardDto): Promise<CreditCardResponseDto> {
    const existingCard = await this.creditCardRepository.findById(cardId);

    if (!existingCard) {
      throw new Error('Cartão de crédito não encontrado');
    }

    if (existingCard.getUserId() !== userId) {
      throw new Error('Acesso não autorizado a este cartão');
    }

    // Verificar se está alterando a conta financeira
    if (dto.contaFinanceiraId && dto.contaFinanceiraId !== existingCard.getContaFinanceiraId()) {
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
    }

    // Verificar se está alterando os últimos dígitos e se já existe outro cartão
    if (dto.ultimosDigitos && dto.ultimosDigitos !== existingCard.getUltimosDigitos()) {
      const existingCards = await this.creditCardRepository.findByUserIdAndLastDigits(
        userId, 
        dto.ultimosDigitos
      );

      const conflictCard = existingCards.find(card => 
        card.getId() !== cardId &&
        card.getBandeira() === (dto.bandeira || existingCard.getBandeira()) && 
        card.getBanco() === (dto.banco || existingCard.getBanco())
      );

      if (conflictCard) {
        throw new Error('Já existe outro cartão com estes últimos dígitos para esta bandeira e banco');
      }
    }

    // Aplicar atualizações específicas usando métodos de domínio
    if (dto.nome) {
      existingCard.updateNome(dto.nome);
    }

    if (dto.limiteTotal) {
      existingCard.updateLimite(dto.limiteTotal);
    }

    if (dto.diaFechamento || dto.diaVencimento) {
      existingCard.updateDatas(
        dto.diaFechamento || existingCard.getDiaFechamento(),
        dto.diaVencimento || existingCard.getDiaVencimento()
      );
    }

    if (dto.ativo !== undefined) {
      if (dto.ativo) {
        existingCard.ativar();
      } else {
        existingCard.desativar();
      }
    }

    // Criar um novo cartão com as alterações (para campos que não têm métodos específicos)
    const updatedCardData = {
      id: existingCard.getId(),
      nome: existingCard.getNome(),
      bandeira: (dto.bandeira || existingCard.getBandeira()) as 'visa' | 'mastercard' | 'elo' | 'american_express' | 'diners' | 'hipercard' | 'outros',
      ultimosDigitos: dto.ultimosDigitos || existingCard.getUltimosDigitos(),
      limiteTotal: existingCard.getLimiteTotal(),
      limiteDisponivel: existingCard.getLimiteDisponivel(),
      diaVencimento: existingCard.getDiaVencimento(),
      diaFechamento: existingCard.getDiaFechamento(),
      banco: dto.banco !== undefined ? dto.banco : existingCard.getBanco(),
      cor: dto.cor !== undefined ? dto.cor : existingCard.getCor(),
      ativo: existingCard.isAtivo(),
      observacoes: dto.observacoes !== undefined ? dto.observacoes : existingCard.getObservacoes(),
      contaFinanceiraId: dto.contaFinanceiraId || existingCard.getContaFinanceiraId(),
      userId: existingCard.getUserId(),
      createdAt: existingCard.getCreatedAt(),
      updatedAt: new Date(),
    };

    const updatedCard = new CreditCard(updatedCardData);
    const savedCard = await this.creditCardRepository.update(cardId, updatedCard);

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