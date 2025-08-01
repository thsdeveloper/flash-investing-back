import {DebtNegotiationResponseDto} from "@src/modules/debts/application/dtos/debt-dtos";
import {DebtNegotiationRepository} from "@src/modules/debts/domain/contracts/debt-negotiation-repository";

export interface ListDebtNegotiationsDto {
  debtId: string;
  userId: string;
  page: number;
  limit: number;
}

export interface ListDebtNegotiationsResponseDto {
  negociacoes: DebtNegotiationResponseDto[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export class ListDebtNegotiationsUseCase {
  constructor(
    private readonly debtNegotiationRepository: DebtNegotiationRepository
  ) {}

  async execute(dto: ListDebtNegotiationsDto): Promise<ListDebtNegotiationsResponseDto> {
    const result = await this.debtNegotiationRepository.findByDebtId(
      dto.debtId,
      dto.userId,
      {
        page: dto.page,
        limit: dto.limit
      }
    );

    return {
      negociacoes: result.data.map(negotiation => ({
        id: negotiation.id,
        divida_id: negotiation.debtId,
        data_negociacao: negotiation.dataNegociacao.toISOString().split('T')[0],
        proposta: negotiation.proposta,
        status: negotiation.status,
        observacoes: negotiation.observacoes ?? null,
        created_at: negotiation.createdAt.toISOString(),
        updated_at: negotiation.updatedAt.toISOString(),
      })),
      pagination: result.pagination
    };
  }
}