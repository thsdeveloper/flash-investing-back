import { DebtRepository } from '../../../domain/contracts/debt-repository';
import { SimulationRequestDto, SimulationResponseDto } from '../../dtos/debt-dtos';

export class SimulatePaymentScenariosUseCase {
  constructor(
    private readonly debtRepository: DebtRepository
  ) {}

  async execute(dto: SimulationRequestDto): Promise<SimulationResponseDto> {
    const debts = await this.debtRepository.findByIds(dto.dividas_ids, dto.userId);

    if (debts.length === 0) {
      throw new Error('Nenhuma dívida encontrada para simulação');
    }

    const totalCurrentDebt = debts.reduce((sum, debt) => sum + debt.valorAtual, 0);
    const simulacoes = [];

    for (const cenario of dto.cenarios) {
      let simulation;

      switch (cenario.tipo) {
        case 'pagamento_minimo':
          simulation = this.simulateMinimumPayment(totalCurrentDebt, cenario);
          break;
        case 'quitacao_desconto':
          simulation = this.simulateDiscountPayoff(totalCurrentDebt, cenario);
          break;
        case 'parcelamento':
          simulation = this.simulateInstallments(totalCurrentDebt, cenario);
          break;
        default:
          continue;
      }

      simulacoes.push(simulation);
    }

    const recomendacao = this.getBestRecommendation(simulacoes);

    return {
      simulacoes,
      recomendacao: recomendacao.cenario,
      justificativa: recomendacao.justificativa,
    };
  }

  private simulateMinimumPayment(totalDebt: number, cenario: any) {
    const valorMensal = cenario.valor_mensal || totalDebt * 0.05; // 5% minimum
    const taxaJurosMensal = 0.02; // 2% monthly interest rate (simplified)
    
    let saldoRestante = totalDebt;
    let meses = 0;
    let totalJuros = 0;

    while (saldoRestante > 0 && meses < 600) { // Max 50 years to avoid infinite loop
      const juros = saldoRestante * taxaJurosMensal;
      const principal = Math.max(0, valorMensal - juros);
      
      if (principal <= 0) {
        // Payment doesn't cover interest, infinite loop scenario
        meses = 600;
        break;
      }

      saldoRestante = Math.max(0, saldoRestante - principal);
      totalJuros += juros;
      meses++;
    }

    return {
      cenario: cenario.nome,
      valor_total_a_pagar: totalDebt + totalJuros,
      tempo_quitacao_meses: meses,
      juros_totais: totalJuros,
      valor_mensal: valorMensal,
    };
  }

  private simulateDiscountPayoff(totalDebt: number, cenario: any) {
    const desconto = (cenario.desconto_percentual || 0) / 100;
    const valorComDesconto = totalDebt * (1 - desconto);
    const economia = totalDebt - valorComDesconto;

    return {
      cenario: cenario.nome,
      valor_total_a_pagar: valorComDesconto,
      tempo_quitacao_meses: 1,
      juros_totais: 0,
      economia,
    };
  }

  private simulateInstallments(totalDebt: number, cenario: any) {
    const numeroParcelas = cenario.numero_parcelas || 12;
    const taxaJurosMensal = (cenario.taxa_juros || 2) / 100;
    
    // Calculate installment using compound interest formula
    const valorParcela = totalDebt * (
      (taxaJurosMensal * Math.pow(1 + taxaJurosMensal, numeroParcelas)) /
      (Math.pow(1 + taxaJurosMensal, numeroParcelas) - 1)
    );

    const valorTotal = valorParcela * numeroParcelas;
    const jurosTotal = valorTotal - totalDebt;

    return {
      cenario: cenario.nome,
      valor_total_a_pagar: valorTotal,
      tempo_quitacao_meses: numeroParcelas,
      juros_totais: jurosTotal,
      valor_mensal: valorParcela,
    };
  }

  private getBestRecommendation(simulacoes: any[]): { cenario: string; justificativa: string } {
    if (simulacoes.length === 0) {
      return {
        cenario: 'Nenhuma simulação disponível',
        justificativa: 'Não foi possível gerar recomendações'
      };
    }

    // Find scenario with lowest total cost
    const melhorCenario = simulacoes.reduce((best, current) => {
      if (current.valor_total_a_pagar < best.valor_total_a_pagar) {
        return current;
      }
      return best;
    });

    // Calculate savings compared to other scenarios
    const economia = simulacoes
      .filter(s => s.cenario !== melhorCenario.cenario)
      .reduce((maxSaving, s) => {
        const saving = s.valor_total_a_pagar - melhorCenario.valor_total_a_pagar;
        return Math.max(maxSaving, saving);
      }, 0);

    let justificativa = `Menor custo total`;
    
    if (economia > 0) {
      justificativa += ` e economia de R$ ${economia.toFixed(2)} comparado às outras opções`;
    }

    if (melhorCenario.tempo_quitacao_meses <= 3) {
      justificativa += ` com quitação rápida`;
    }

    return {
      cenario: melhorCenario.cenario,
      justificativa
    };
  }
}