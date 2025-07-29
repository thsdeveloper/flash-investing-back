import { PrismaClient } from '@prisma/client';
import { Debt } from '../../../domain/entities/debt';
import { 
  DebtRepository, 
  DebtFilters, 
  DebtSort, 
  PaginationOptions, 
  PaginatedResult 
} from '../../../domain/contracts/debt-repository';

export class PrismaDebtRepository implements DebtRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(debt: Debt): Promise<Debt> {
    const data = await this.prisma.debt.create({
      data: {
        id: debt.id,
        credor: debt.credor,
        tipoDiv: debt.tipoDiv,
        valorOriginal: debt.valorOriginal,
        valorAtual: debt.valorAtual,
        taxaJuros: debt.taxaJuros,
        dataVencimento: debt.dataVencimento,
        status: debt.status,
        descricao: debt.descricao,
        parcelasTotal: debt.parcelasTotal,
        valorParcela: debt.valorParcela,
        userId: debt.userId,
        createdAt: debt.createdAt,
        updatedAt: debt.updatedAt,
      },
    });

    return this.toDomain(data);
  }

  async findById(id: string, userId: string): Promise<Debt | null> {
    const data = await this.prisma.debt.findFirst({
      where: { id, userId },
    });

    return data ? this.toDomain(data) : null;
  }

  async findMany(
    filters: DebtFilters,
    sort: DebtSort,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Debt>> {
    const where = {
      userId: filters.userId,
      ...(filters.status && { status: filters.status as any }),
      ...(filters.credor && { 
        credor: { 
          contains: filters.credor, 
          mode: 'insensitive' as const 
        } 
      }),
    };

    // Map API field names to Prisma field names
    const fieldMapping = {
      'created_at': 'createdAt',
      'data_vencimento': 'dataVencimento',
      'valor': 'valorAtual'
    };

    const prismaField = fieldMapping[sort.field as keyof typeof fieldMapping] || sort.field;

    const [data, total] = await Promise.all([
      this.prisma.debt.findMany({
        where,
        orderBy: { [prismaField]: sort.order },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      this.prisma.debt.count({ where }),
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

  async findByIdWithRelations(id: string, userId: string): Promise<Debt & {
    payments: Array<{
      id: string;
      valor: number;
      data_pagamento: Date;
      tipo: 'pagamento_parcial' | 'quitacao_total';
      observacoes?: string;
    }>;
    negotiations: Array<{
      id: string;
      data_negociacao: Date;
      proposta: string;
      status: 'pendente' | 'aceita' | 'rejeitada' | 'em_andamento';
      observacoes?: string;
    }>;
  } | null> {
    // First try without relations to see if basic debt exists
    const basicDebt = await this.prisma.debt.findFirst({
      where: { id, userId }
    });
    
    if (!basicDebt) {
      return null;
    }

    // Convert basic debt to proper response format
    return {
      id: basicDebt.id,
      credor: basicDebt.credor,
      tipoDiv: basicDebt.tipoDiv,
      valorOriginal: Number(basicDebt.valorOriginal),
      valorAtual: Number(basicDebt.valorAtual),
      taxaJuros: basicDebt.taxaJuros ? Number(basicDebt.taxaJuros) : null,
      dataVencimento: basicDebt.dataVencimento,
      status: basicDebt.status,
      descricao: basicDebt.descricao,
      parcelasTotal: basicDebt.parcelasTotal,
      valorParcela: basicDebt.valorParcela ? Number(basicDebt.valorParcela) : null,
      userId: basicDebt.userId,
      createdAt: basicDebt.createdAt,
      updatedAt: basicDebt.updatedAt,
      payments: [],
      negotiations: []
    } as any;
  }

  async update(debt: Debt): Promise<Debt> {
    const data = await this.prisma.debt.update({
      where: { id: debt.id },
      data: {
        credor: debt.credor,
        valorAtual: debt.valorAtual,
        taxaJuros: debt.taxaJuros,
        dataVencimento: debt.dataVencimento,
        status: debt.status,
        descricao: debt.descricao,
        updatedAt: debt.updatedAt,
      },
    });

    return this.toDomain(data);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.debt.deleteMany({
      where: { id, userId },
    });
  }

  async findUpcomingDueDates(userId: string, limit = 10): Promise<Array<{
    id: string;
    credor: string;
    valor_atual: number;
    data_vencimento: Date;
  }>> {
    const data = await this.prisma.debt.findMany({
      where: {
        userId,
        status: { in: ['ativa', 'em_negociacao'] },
        dataVencimento: { gte: new Date() },
      },
      orderBy: { dataVencimento: 'asc' },
      take: limit,
      select: {
        id: true,
        credor: true,
        valorAtual: true,
        dataVencimento: true,
      },
    });

    return data.map(item => ({
      id: item.id,
      credor: item.credor,
      valor_atual: Number(item.valorAtual),
      data_vencimento: item.dataVencimento,
    }));
  }

  async findOverdueDebts(userId: string): Promise<Debt[]> {
    const data = await this.prisma.debt.findMany({
      where: {
        userId,
        status: 'ativa',
        dataVencimento: { lt: new Date() },
      },
    });

    return data.map(this.toDomain);
  }

  async getSummaryByUser(userId: string): Promise<{
    total_dividas: number;
    valor_total_original: number;
    valor_total_atual: number;
    total_pago: number;
    dividas_por_status: {
      ativa: number;
      em_negociacao: number;
      quitada: number;
    };
    dividas_por_tipo: Record<string, number>;
  }> {
    const [debts, totalPaid] = await Promise.all([
      this.prisma.debt.findMany({
        where: { userId },
        select: {
          valorOriginal: true,
          valorAtual: true,
          status: true,
          tipoDiv: true,
        },
      }),
      this.prisma.debtPayment.aggregate({
        where: { userId },
        _sum: { valor: true },
      }),
    ]);

    const totalOriginal = debts.reduce((sum, debt) => sum + Number(debt.valorOriginal), 0);
    const totalAtual = debts.reduce((sum, debt) => sum + Number(debt.valorAtual), 0);

    const statusCounts = debts.reduce((acc, debt) => {
      acc[debt.status] = (acc[debt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeCounts = debts.reduce((acc, debt) => {
      acc[debt.tipoDiv] = (acc[debt.tipoDiv] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_dividas: debts.length,
      valor_total_original: totalOriginal,
      valor_total_atual: totalAtual,
      total_pago: Number(totalPaid._sum.valor || 0),
      dividas_por_status: {
        ativa: statusCounts['ativa'] || 0,
        em_negociacao: statusCounts['em_negociacao'] || 0,
        quitada: statusCounts['quitada'] || 0,
      },
      dividas_por_tipo: typeCounts,
    };
  }

  async getEvolution(userId: string, months: number): Promise<Array<{
    mes: string;
    valor_total: number;
    total_pago: number;
    saldo_devedor: number;
  }>> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Esta é uma implementação simplificada
    // Em um cenário real, seria necessário uma query mais complexa
    // para calcular a evolução histórica mês a mês
    const data = await this.prisma.debt.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      include: {
        payments: true,
      },
    });

    // Agrupa por mês e calcula totais
    const monthlyData = new Map<string, {
      valor_total: number;
      total_pago: number;
      saldo_devedor: number;
    }>();

    data.forEach(debt => {
      const monthKey = debt.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const current = monthlyData.get(monthKey) || {
        valor_total: 0,
        total_pago: 0,
        saldo_devedor: 0,
      };

      const totalPago = debt.payments.reduce((sum, payment) => sum + Number(payment.valor), 0);

      monthlyData.set(monthKey, {
        valor_total: current.valor_total + Number(debt.valorOriginal),
        total_pago: current.total_pago + totalPago,
        saldo_devedor: current.saldo_devedor + Number(debt.valorAtual),
      });
    });

    return Array.from(monthlyData.entries()).map(([mes, values]) => ({
      mes,
      ...values,
    })).sort((a, b) => a.mes.localeCompare(b.mes));
  }

  async findByIds(ids: string[], userId: string): Promise<Debt[]> {
    const data = await this.prisma.debt.findMany({
      where: {
        id: { in: ids },
        userId,
      },
    });

    return data.map(this.toDomain);
  }

  private toDomain(data: any): Debt {
    return Debt.restore({
      id: data.id,
      credor: data.credor,
      tipoDiv: data.tipoDiv,
      valorOriginal: Number(data.valorOriginal),
      valorAtual: Number(data.valorAtual),
      taxaJuros: data.taxaJuros ? Number(data.taxaJuros) : undefined,
      dataVencimento: data.dataVencimento,
      status: data.status,
      descricao: data.descricao,
      parcelasTotal: data.parcelasTotal,
      valorParcela: data.valorParcela ? Number(data.valorParcela) : undefined,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}