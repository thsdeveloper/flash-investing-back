import { PrismaClient } from '@prisma/client';
import { DebtPayment } from '../../../domain/entities/debt-payment';
import { DebtPaymentRepository } from '../../../domain/contracts/debt-payment-repository';

export class PrismaDebtPaymentRepository implements DebtPaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(payment: DebtPayment): Promise<DebtPayment> {
    const data = await this.prisma.debtPayment.create({
      data: {
        id: payment.id,
        debtId: payment.debtId,
        valor: payment.valor,
        dataPagamento: payment.dataPagamento,
        tipo: payment.tipo,
        observacoes: payment.observacoes,
        userId: payment.userId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      },
    });

    return this.toDomain(data);
  }

  async findById(id: string, userId: string): Promise<DebtPayment | null> {
    const data = await this.prisma.debtPayment.findFirst({
      where: { id, userId },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByDebtId(
    debtId: string,
    userId: string,
    pagination = { page: 1, limit: 10 }
  ): Promise<{
    data: DebtPayment[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  }> {
    const where = { debtId, userId };

    const [data, total] = await Promise.all([
      this.prisma.debtPayment.findMany({
        where,
        orderBy: { dataPagamento: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      this.prisma.debtPayment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);

    return {
      data: data.map(this.toDomain),
      pagination: {
        current_page: pagination.page,
        total_pages: totalPages,
        total_items: total,
        items_per_page: pagination.limit,
      },
    };
  }

  async update(payment: DebtPayment): Promise<DebtPayment> {
    const data = await this.prisma.debtPayment.update({
      where: { id: payment.id },
      data: {
        observacoes: payment.observacoes,
        updatedAt: payment.updatedAt,
      },
    });

    return this.toDomain(data);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.debtPayment.deleteMany({
      where: { id, userId },
    });
  }

  async getTotalPaidByDebt(debtId: string, userId: string): Promise<number> {
    const result = await this.prisma.debtPayment.aggregate({
      where: { debtId, userId },
      _sum: { valor: true },
    });

    return Number(result._sum.valor || 0);
  }

  async getTotalPaidByUser(userId: string): Promise<number> {
    const result = await this.prisma.debtPayment.aggregate({
      where: { userId },
      _sum: { valor: true },
    });

    return Number(result._sum.valor || 0);
  }

  private toDomain(data: any): DebtPayment {
    return DebtPayment.restore({
      id: data.id,
      debtId: data.debtId,
      valor: Number(data.valor),
      dataPagamento: data.dataPagamento,
      tipo: data.tipo,
      observacoes: data.observacoes,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}