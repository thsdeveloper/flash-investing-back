import { DebtRepository } from '../../../domain/contracts/debt-repository';
import { UpdateDebtDto, DebtResponseDto } from '../../dtos/debt-dtos';
import { Debt } from '../../../domain/entities/debt';

export class UpdateDebtUseCase {
  constructor(
    private readonly debtRepository: DebtRepository
  ) {}

  async execute(dto: UpdateDebtDto): Promise<DebtResponseDto | null> {
    const debt = await this.debtRepository.findById(dto.id, dto.userId);

    if (!debt) {
      return null;
    }

    // Apply updates
    if (dto.credor !== undefined) {
      debt.updateCredor(dto.credor);
    }

    if (dto.taxa_juros !== undefined) {
      debt.updateTaxaJuros(dto.taxa_juros);
    }

    if (dto.data_vencimento !== undefined) {
      debt.updateDataVencimento(dto.data_vencimento);
    }

    if (dto.descricao !== undefined) {
      debt.updateDescricao(dto.descricao);
    }

    if (dto.status !== undefined) {
      debt.updateStatus(dto.status);
    }

    const savedDebt = await this.debtRepository.update(debt);

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