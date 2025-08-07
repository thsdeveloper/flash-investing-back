import { PrismaClient } from '@prisma/client';
import {Transaction} from "@src/modules/transactions/domain/entities/transaction";
import {TransactionRepository} from "@src/modules/transactions/domain/contracts/transaction-repository";

export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const data = await this.prisma.transaction.create({
      data: {
        descricao: transaction.getDescricao(),
        valor: transaction.getValor(),
        tipo: transaction.getTipo(),
        categoria: transaction.getCategoria(),
        categoriaId: transaction.getCategoriaId(),
        subcategoria: transaction.getSubcategoria(),
        data: transaction.getData(),
        status: transaction.getStatus(),
        observacoes: transaction.getObservacoes(),
        contaFinanceiraId: transaction.getContaFinanceiraId(),
        userId: transaction.getUserId(),
        createdAt: transaction.getCreatedAt(),
        updatedAt: transaction.getUpdatedAt()
      }
    });

    return new Transaction({
      id: data.id,
      descricao: data.descricao,
      valor: data.valor.toNumber(),
      tipo: data.tipo as 'receita' | 'despesa' | 'transferencia',
      categoria: data.categoria || undefined,
      categoriaId: data.categoriaId || undefined,
      subcategoria: data.subcategoria || undefined,
      data: data.data,
      status: data.status as 'pending' | 'completed',
      observacoes: data.observacoes || undefined,
      contaFinanceiraId: data.contaFinanceiraId || undefined,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }

  async findById(id: string): Promise<Transaction | null> {
    const data = await this.prisma.transaction.findUnique({
      where: { id }
    });

    if (!data) return null;

    return new Transaction({
      id: data.id,
      descricao: data.descricao,
      valor: data.valor.toNumber(),
      tipo: data.tipo as 'receita' | 'despesa' | 'transferencia',
      categoria: data.categoria || undefined,
      categoriaId: data.categoriaId || undefined,
      subcategoria: data.subcategoria || undefined,
      data: data.data,
      status: data.status as 'pending' | 'completed',
      observacoes: data.observacoes || undefined,
      contaFinanceiraId: data.contaFinanceiraId || undefined,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const data = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { data: 'desc' }
    });

    return data.map(item => new Transaction({
      id: item.id,
      descricao: item.descricao,
      valor: item.valor.toNumber(),
      tipo: item.tipo as 'receita' | 'despesa' | 'transferencia',
      categoria: item.categoria || undefined,
      categoriaId: item.categoriaId || undefined,
      subcategoria: item.subcategoria || undefined,
      data: item.data,
      status: item.status as 'pending' | 'completed',
      observacoes: item.observacoes || undefined,
      contaFinanceiraId: item.contaFinanceiraId || undefined,
      userId: item.userId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    const data = await this.prisma.transaction.findMany({
      where: { contaFinanceiraId: accountId },
      orderBy: { data: 'desc' }
    });

    return data.map(item => new Transaction({
      id: item.id,
      descricao: item.descricao,
      valor: item.valor.toNumber(),
      tipo: item.tipo as 'receita' | 'despesa' | 'transferencia',
      categoria: item.categoria || undefined,
      categoriaId: item.categoriaId || undefined,
      subcategoria: item.subcategoria || undefined,
      data: item.data,
      status: item.status as 'pending' | 'completed',
      observacoes: item.observacoes || undefined,
      contaFinanceiraId: item.contaFinanceiraId || undefined,
      userId: item.userId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }

  async findByUserIdAndAccountId(userId: string, accountId: string): Promise<Transaction[]> {
    const data = await this.prisma.transaction.findMany({
      where: { 
        userId,
        contaFinanceiraId: accountId
      },
      orderBy: { data: 'desc' }
    });

    return data.map(item => new Transaction({
      id: item.id,
      descricao: item.descricao,
      valor: item.valor.toNumber(),
      tipo: item.tipo as 'receita' | 'despesa' | 'transferencia',
      categoria: item.categoria || undefined,
      categoriaId: item.categoriaId || undefined,
      subcategoria: item.subcategoria || undefined,
      data: item.data,
      status: item.status as 'pending' | 'completed',
      observacoes: item.observacoes || undefined,
      contaFinanceiraId: item.contaFinanceiraId || undefined,
      userId: item.userId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }

  async findByUserIdAndCategory(userId: string, category: string): Promise<Transaction[]> {
    const data = await this.prisma.transaction.findMany({
      where: { 
        userId,
        OR: [
          { categoria: category },      // Buscar por nome da categoria (compatibilidade)
          { categoriaId: category }     // Buscar por ID da categoria (nova forma)
        ]
      },
      orderBy: { data: 'desc' }
    });

    return data.map(item => new Transaction({
      id: item.id,
      descricao: item.descricao,
      valor: item.valor.toNumber(),
      tipo: item.tipo as 'receita' | 'despesa' | 'transferencia',
      categoria: item.categoria || undefined,
      categoriaId: item.categoriaId || undefined,
      subcategoria: item.subcategoria || undefined,
      data: item.data,
      status: item.status as 'pending' | 'completed',
      observacoes: item.observacoes || undefined,
      contaFinanceiraId: item.contaFinanceiraId || undefined,
      userId: item.userId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }

  async findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    const data = await this.prisma.transaction.findMany({
      where: { 
        userId,
        data: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { data: 'desc' }
    });

    return data.map(item => new Transaction({
      id: item.id,
      descricao: item.descricao,
      valor: item.valor.toNumber(),
      tipo: item.tipo as 'receita' | 'despesa' | 'transferencia',
      categoria: item.categoria || undefined,
      categoriaId: item.categoriaId || undefined,
      subcategoria: item.subcategoria || undefined,
      data: item.data,
      status: item.status as 'pending' | 'completed',
      observacoes: item.observacoes || undefined,
      contaFinanceiraId: item.contaFinanceiraId || undefined,
      userId: item.userId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const id = transaction.getId();
    if (!id) {
      throw new Error('Transaction ID is required for update');
    }

    const data = await this.prisma.transaction.update({
      where: { id },
      data: {
        descricao: transaction.getDescricao(),
        valor: transaction.getValor(),
        tipo: transaction.getTipo(),
        categoria: transaction.getCategoria(),
        subcategoria: transaction.getSubcategoria(),
        data: transaction.getData(),
        status: transaction.getStatus(),
        observacoes: transaction.getObservacoes(),
        contaFinanceiraId: transaction.getContaFinanceiraId(),
        updatedAt: transaction.getUpdatedAt()
      }
    });

    return new Transaction({
      id: data.id,
      descricao: data.descricao,
      valor: data.valor.toNumber(),
      tipo: data.tipo as 'receita' | 'despesa' | 'transferencia',
      categoria: data.categoria || undefined,
      categoriaId: data.categoriaId || undefined,
      subcategoria: data.subcategoria || undefined,
      data: data.data,
      status: data.status as 'pending' | 'completed',
      observacoes: data.observacoes || undefined,
      contaFinanceiraId: data.contaFinanceiraId || undefined,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({
      where: { id }
    });
  }

  async getTotalByUserAndCategory(userId: string, category: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      where: {
        userId,
        categoria: category,
        data: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        valor: true
      }
    });

    return result._sum.valor?.toNumber() || 0;
  }

  async getTotalByUserAndType(userId: string, type: 'receita' | 'despesa', startDate: Date, endDate: Date): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      where: {
        userId,
        tipo: type,
        data: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        valor: true
      }
    });

    return result._sum.valor?.toNumber() || 0;
  }

  async countByAccountId(accountId: string): Promise<number> {
    return await this.prisma.transaction.count({
      where: { contaFinanceiraId: accountId }
    });
  }
}