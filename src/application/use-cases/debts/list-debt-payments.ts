import { DebtPaymentRepository } from '../../../domain/contracts/debt-payment-repository';
import { DebtPaymentResponseDto } from '../../dtos/debt-dtos';
import { DebtPayment } from '../../../domain/entities/debt-payment';

export class ListDebtPaymentsUseCase {
  constructor(
    private readonly debtPaymentRepository: DebtPaymentRepository
  ) {}

  async execute(
    debtId: string,
    userId: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<{
    pagamentos: DebtPaymentResponseDto[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  }> {
    const result = await this.debtPaymentRepository.findByDebtId(
      debtId,
      userId,
      pagination
    );

    return {
      pagamentos: result.data.map(this.toResponseDto),
      pagination: result.pagination,
    };
  }

  private toResponseDto(payment: DebtPayment): DebtPaymentResponseDto {
    return {
      id: payment.id,
      divida_id: payment.debtId,
      valor: payment.valor,
      data_pagamento: payment.dataPagamento?.toISOString() || new Date().toISOString(),
      tipo: payment.tipo,
      observacoes: payment.observacoes ?? null,
      created_at: payment.createdAt?.toISOString() || new Date().toISOString(),
    };
  }
}