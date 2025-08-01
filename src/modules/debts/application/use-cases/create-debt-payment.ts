import {DebtRepository} from "@src/modules/debts/domain/contracts/debt-repository";
import {DebtPaymentRepository} from "@src/modules/debts/domain/contracts/debt-payment-repository";
import {CreateDebtPaymentDto, DebtPaymentResponseDto} from "@src/modules/debts/application/dtos/debt-dtos";
import {DebtPayment} from "@src/modules/debts/domain/entities/debt-payment";

export class CreateDebtPaymentUseCase {
  constructor(
    private readonly debtRepository: DebtRepository,
    private readonly debtPaymentRepository: DebtPaymentRepository
  ) {}

  async execute(dto: CreateDebtPaymentDto): Promise<{
    payment: DebtPaymentResponseDto;
    debtUpdated: boolean;
  } | null> {
    const debt = await this.debtRepository.findById(dto.debtId, dto.userId);

    if (!debt) {
      return null;
    }

    // Validate payment amount
    if (dto.valor > debt.valorAtual) {
      throw new Error('Valor do pagamento não pode ser maior que o saldo devedor');
    }

    // Create payment
    const payment = DebtPayment.create({
      debtId: dto.debtId,
      valor: dto.valor,
      dataPagamento: dto.data_pagamento,
      tipo: dto.tipo,
      observacoes: dto.observacoes,
      userId: dto.userId,
    });

    // Update debt balance
    debt.registerPayment(dto.valor);

    // Save both
    const [savedPayment] = await Promise.all([
      this.debtPaymentRepository.create(payment),
      this.debtRepository.update(debt),
    ]);

    return {
      payment: {
        id: savedPayment.id,
        divida_id: savedPayment.debtId,
        valor: savedPayment.valor,
        data_pagamento: savedPayment.dataPagamento?.toISOString() || new Date().toISOString(),
        tipo: savedPayment.tipo,
        observacoes: savedPayment.observacoes ?? null,
        created_at: savedPayment.createdAt?.toISOString() || new Date().toISOString(),
      },
      debtUpdated: true,
    };
  }
}