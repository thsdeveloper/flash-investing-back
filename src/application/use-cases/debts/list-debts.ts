import { DebtRepository } from '../../../domain/contracts/debt-repository';
import { ListDebtsQueryDto, DebtResponseDto } from '../../dtos/debt-dtos';
import { Debt } from '../../../domain/entities/debt';

export class ListDebtsUseCase {
  constructor(
    private readonly debtRepository: DebtRepository
  ) {}

  async execute(query: ListDebtsQueryDto): Promise<{
    dividas: DebtResponseDto[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  }> {
    const result = await this.debtRepository.findMany(
      {
        userId: query.userId,
        status: query.status,
        credor: query.credor,
      },
      {
        field: query.sort,
        order: query.order,
      },
      {
        page: query.page,
        limit: query.limit,
      }
    );

    return {
      dividas: result.data.map(this.toResponseDto),
      pagination: result.pagination,
    };
  }

  private toResponseDto(debt: Debt): DebtResponseDto {
    return {
      id: debt.id,
      credor: debt.credor,
      tipo_divida: debt.tipoDiv,
      valor_original: debt.valorOriginal,
      valor_atual: debt.valorAtual,
      taxa_juros: debt.taxaJuros ?? null,
      data_vencimento: debt.dataVencimento?.toISOString() || new Date().toISOString(),
      status: debt.status,
      descricao: debt.descricao ?? null,
      parcelas_total: debt.parcelasTotal ?? null,
      valor_parcela: debt.valorParcela ?? null,
      created_at: debt.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: debt.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}