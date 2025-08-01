import { PrismaClient } from '@prisma/client';
import {
  DebtNegotiationFilters,
  DebtNegotiationRepository
} from "@src/modules/debts/domain/contracts/debt-negotiation-repository";
import {DebtNegotiation} from "@src/modules/debts/domain/entities/debt-negotiation";

export class PrismaDebtNegotiationRepository implements DebtNegotiationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(negotiation: DebtNegotiation): Promise<DebtNegotiation> {
    const data = await this.prisma.debtNegotiation.create({
      data: {
        id: negotiation.id,
        debtId: negotiation.debtId,
        dataNegociacao: negotiation.dataNegociacao,
        proposta: negotiation.proposta,
        status: negotiation.status,
        observacoes: negotiation.observacoes,
        userId: negotiation.userId,
        createdAt: negotiation.createdAt,
        updatedAt: negotiation.updatedAt,
      },
    });

    return this.toDomain(data);
  }

  async findById(id: string, userId: string): Promise<DebtNegotiation | null> {
    const data = await this.prisma.debtNegotiation.findFirst({
      where: { id, userId },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByDebtId(
    debtId: string,
    userId: string,
    pagination = { page: 1, limit: 10 }
  ): Promise<{
    data: DebtNegotiation[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  }> {
    const where = { debtId, userId };

    const [data, total] = await Promise.all([
      this.prisma.debtNegotiation.findMany({
        where,
        orderBy: { dataNegociacao: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      this.prisma.debtNegotiation.count({ where }),
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

  async findMany(
    filters: DebtNegotiationFilters,
    pagination = { page: 1, limit: 10 }
  ): Promise<{
    data: DebtNegotiation[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  }> {
    const where = {
      userId: filters.userId,
      ...(filters.debtId && { debtId: filters.debtId }),
      ...(filters.status && { status: filters.status as any }),
    };

    const [data, total] = await Promise.all([
      this.prisma.debtNegotiation.findMany({
        where,
        orderBy: { dataNegociacao: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      this.prisma.debtNegotiation.count({ where }),
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

  async update(negotiation: DebtNegotiation): Promise<DebtNegotiation> {
    const data = await this.prisma.debtNegotiation.update({
      where: { id: negotiation.id },
      data: {
        status: negotiation.status,
        observacoes: negotiation.observacoes,
        updatedAt: negotiation.updatedAt,
      },
    });

    return this.toDomain(data);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.debtNegotiation.deleteMany({
      where: { id, userId },
    });
  }

  async findPendingNegotiations(userId: string): Promise<DebtNegotiation[]> {
    const data = await this.prisma.debtNegotiation.findMany({
      where: {
        userId,
        status: 'pendente',
      },
      orderBy: { dataNegociacao: 'desc' },
    });

    return data.map(this.toDomain);
  }

  private toDomain(data: any): DebtNegotiation {
    return DebtNegotiation.restore({
      id: data.id,
      debtId: data.debtId,
      dataNegociacao: data.dataNegociacao,
      proposta: data.proposta,
      status: data.status,
      observacoes: data.observacoes,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}