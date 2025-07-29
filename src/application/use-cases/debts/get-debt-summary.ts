import { DebtRepository } from '../../../domain/contracts/debt-repository';
import { DebtSummaryResponseDto } from '../../dtos/debt-dtos';

export class GetDebtSummaryUseCase {
  constructor(
    private readonly debtRepository: DebtRepository
  ) {}

  async execute(userId: string): Promise<DebtSummaryResponseDto> {
    const [summary, upcomingDueDates] = await Promise.all([
      this.debtRepository.getSummaryByUser(userId),
      this.debtRepository.findUpcomingDueDates(userId, 5),
    ]);

    return {
      total_dividas: summary.total_dividas,
      valor_total_original: summary.valor_total_original,
      valor_total_atual: summary.valor_total_atual,
      total_pago: summary.total_pago,
      dividas_por_status: summary.dividas_por_status,
      dividas_por_tipo: summary.dividas_por_tipo,
      proximos_vencimentos: upcomingDueDates.map(item => ({
        id: item.id,
        credor: item.credor,
        valor_atual: item.valor_atual,
        data_vencimento: item.data_vencimento?.toISOString() || new Date().toISOString(),
      })),
    };
  }
}