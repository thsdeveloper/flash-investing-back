import { Debt } from '../../../domain/entities/debt';
import { DebtRepository } from '../../../domain/contracts/debt-repository';
import { CreateDebtDto, DebtResponseDto } from '../../dtos/debt-dtos';

export class CreateDebtUseCase {
  constructor(
    private readonly debtRepository: DebtRepository
  ) {}

  async execute(dto: CreateDebtDto): Promise<DebtResponseDto> {
    const debt = Debt.create({
      credor: dto.credor,
      tipoDiv: dto.tipo_divida,
      valorOriginal: dto.valor_original,
      taxaJuros: dto.taxa_juros,
      dataVencimento: dto.data_vencimento,
      descricao: dto.descricao,
      parcelasTotal: dto.parcelas_total,
      valorParcela: dto.valor_parcela,
      userId: dto.userId,
    });

    const savedDebt = await this.debtRepository.create(debt);

    return this.toResponseDto(savedDebt);
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