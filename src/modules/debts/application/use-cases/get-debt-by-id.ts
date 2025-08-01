import {DebtRepository} from "@src/modules/debts/domain/contracts/debt-repository";
import {DebtWithRelationsResponseDto} from "@src/modules/debts/application/dtos/debt-dtos";

export class GetDebtByIdUseCase {
  constructor(
    private readonly debtRepository: DebtRepository
  ) {}

  async execute(id: string, userId: string): Promise<DebtWithRelationsResponseDto | null> {
    const debt = await this.debtRepository.findByIdWithRelations(id, userId);

    if (!debt) {
      return null;
    }

    const safeToISOString = (date: any) => {
      if (!date) return new Date().toISOString();
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return new Date().toISOString();
    };
    
    return {
      id: debt.id,
      credor: debt.credor,
      tipo_divida: debt.tipoDiv,
      valor_original: debt.valorOriginal,
      valor_atual: debt.valorAtual,
      taxa_juros: debt.taxaJuros ?? null,
      data_vencimento: safeToISOString(debt.dataVencimento),
      status: debt.status,
      descricao: debt.descricao ?? null,
      parcelas_total: debt.parcelasTotal ?? null,
      valor_parcela: debt.valorParcela ?? null,
      created_at: safeToISOString(debt.createdAt),
      updated_at: safeToISOString(debt.updatedAt),
      pagamentos: (debt.payments || []).map(payment => ({
        id: payment?.id,
        valor: payment?.valor,
        data_pagamento: safeToISOString(payment?.data_pagamento),
        tipo: payment?.tipo,
        observacoes: payment?.observacoes ?? null,
      })),
      negociacoes: (debt.negotiations || []).map(negotiation => ({
        id: negotiation?.id,
        data_negociacao: safeToISOString(negotiation?.data_negociacao),
        proposta: negotiation?.proposta,
        status: negotiation?.status,
        observacoes: negotiation?.observacoes ?? null,
      })),
    };
  }
}