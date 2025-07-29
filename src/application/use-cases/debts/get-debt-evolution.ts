import { DebtRepository } from '../../../domain/contracts/debt-repository';
import { EvolutionReportQueryDto, EvolutionReportResponseDto } from '../../dtos/debt-dtos';

export class GetDebtEvolutionUseCase {
  constructor(
    private readonly debtRepository: DebtRepository
  ) {}

  async execute(query: EvolutionReportQueryDto): Promise<EvolutionReportResponseDto> {
    const months = this.getMonthsFromPeriod(query.periodo);
    const evolution = await this.debtRepository.getEvolution(query.userId, months);

    const tendencia = this.calculateTrend(evolution);
    const reducaoPercentual = this.calculateReduction(evolution);

    return {
      evolucao_mensal: evolution,
      tendencia,
      reducao_percentual: reducaoPercentual,
    };
  }

  private getMonthsFromPeriod(periodo: '3m' | '6m' | '1y' | 'all'): number {
    switch (periodo) {
      case '3m': return 3;
      case '6m': return 6;
      case '1y': return 12;
      case 'all': return 24; // 2 years max for performance
      default: return 6;
    }
  }

  private calculateTrend(evolution: Array<{
    mes: string;
    valor_total: number;
    total_pago: number;
    saldo_devedor: number;
  }>): 'crescente' | 'decrescente' | 'estavel' {
    if (evolution.length < 2) return 'estavel';

    const first = evolution[0];
    const last = evolution[evolution.length - 1];

    const difference = last.saldo_devedor - first.saldo_devedor;
    const threshold = first.saldo_devedor * 0.05; // 5% threshold

    if (difference > threshold) return 'crescente';
    if (difference < -threshold) return 'decrescente';
    return 'estavel';
  }

  private calculateReduction(evolution: Array<{
    mes: string;
    valor_total: number;
    total_pago: number;
    saldo_devedor: number;
  }>): number {
    if (evolution.length < 2) return 0;

    const first = evolution[0];
    const last = evolution[evolution.length - 1];

    if (first.saldo_devedor === 0) return 0;

    const reduction = ((first.saldo_devedor - last.saldo_devedor) / first.saldo_devedor) * 100;
    return Math.max(0, Math.round(reduction * 100) / 100); // Round to 2 decimal places
  }
}