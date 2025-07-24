import { PrismaClient } from '@prisma/client';
import { CreditCardTransaction } from '../../../domain/entities/credit-card-transaction';
import { CreditCardTransactionRepository } from '../../../domain/contracts/credit-card-transaction-repository';

export class PrismaCreditCardTransactionRepository implements CreditCardTransactionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(transaction: CreditCardTransaction): Promise<CreditCardTransaction> {
    const data = await this.prisma.creditCardTransaction.create({
      data: {
        descricao: transaction.getDescricao(),
        valor: transaction.getValor(),
        categoria: transaction.getCategoria(),
        subcategoria: transaction.getSubcategoria(),
        dataCompra: transaction.getDataCompra(),
        parcelas: transaction.getParcelas(),
        parcelaAtual: transaction.getParcelaAtual(),
        estabelecimento: transaction.getEstabelecimento(),
        observacoes: transaction.getObservacoes(),
        creditCardId: transaction.getCreditCardId(),
        invoiceId: transaction.getInvoiceId(),
        userId: transaction.getUserId(),
      },
    });

    return new CreditCardTransaction(
      data.id,
      data.descricao,
      data.valor.toNumber(),
      data.categoria,
      data.subcategoria,
      data.dataCompra,
      data.parcelas,
      data.parcelaAtual,
      data.estabelecimento,
      data.observacoes,
      data.creditCardId,
      data.invoiceId,
      data.userId,
      data.createdAt,
      data.updatedAt
    );
  }

  async findById(id: string): Promise<CreditCardTransaction | null> {
    const data = await this.prisma.creditCardTransaction.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return new CreditCardTransaction(
      data.id,
      data.descricao,
      data.valor.toNumber(),
      data.categoria,
      data.subcategoria,
      data.dataCompra,
      data.parcelas,
      data.parcelaAtual,
      data.estabelecimento,
      data.observacoes,
      data.creditCardId,
      data.invoiceId,
      data.userId,
      data.createdAt,
      data.updatedAt
    );
  }

  async findByUserId(userId: string): Promise<CreditCardTransaction[]> {
    const data = await this.prisma.creditCardTransaction.findMany({
      where: { userId },
      orderBy: { dataCompra: 'desc' },
    });

    return data.map(item => new CreditCardTransaction(
      item.id,
      item.descricao,
      item.valor.toNumber(),
      item.categoria,
      item.subcategoria,
      item.dataCompra,
      item.parcelas,
      item.parcelaAtual,
      item.estabelecimento,
      item.observacoes,
      item.creditCardId,
      item.invoiceId,
      item.userId,
      item.createdAt,
      item.updatedAt
    ));
  }

  async findByCreditCardId(creditCardId: string): Promise<CreditCardTransaction[]> {
    const data = await this.prisma.creditCardTransaction.findMany({
      where: { creditCardId },
      orderBy: { dataCompra: 'desc' },
    });

    return data.map(item => new CreditCardTransaction(
      item.id,
      item.descricao,
      item.valor.toNumber(),
      item.categoria,
      item.subcategoria,
      item.dataCompra,
      item.parcelas,
      item.parcelaAtual,
      item.estabelecimento,
      item.observacoes,
      item.creditCardId,
      item.invoiceId,
      item.userId,
      item.createdAt,
      item.updatedAt
    ));
  }

  async findByInvoiceId(invoiceId: string): Promise<CreditCardTransaction[]> {
    const data = await this.prisma.creditCardTransaction.findMany({
      where: { invoiceId },
      orderBy: { dataCompra: 'desc' },
    });

    return data.map(item => new CreditCardTransaction(
      item.id,
      item.descricao,
      item.valor.toNumber(),
      item.categoria,
      item.subcategoria,
      item.dataCompra,
      item.parcelas,
      item.parcelaAtual,
      item.estabelecimento,
      item.observacoes,
      item.creditCardId,
      item.invoiceId,
      item.userId,
      item.createdAt,
      item.updatedAt
    ));
  }

  async findByUserIdWithFilters(
    userId: string, 
    filters: {
      creditCardId?: string;
      categoria?: string;
      dataInicio?: Date;
      dataFim?: Date;
      search?: string;
    }
  ): Promise<CreditCardTransaction[]> {
    const where: any = { userId };

    if (filters.creditCardId) {
      where.creditCardId = filters.creditCardId;
    }

    if (filters.categoria) {
      where.categoria = filters.categoria;
    }

    if (filters.dataInicio || filters.dataFim) {
      where.dataCompra = {};
      if (filters.dataInicio) {
        where.dataCompra.gte = filters.dataInicio;
      }
      if (filters.dataFim) {
        where.dataCompra.lte = filters.dataFim;
      }
    }

    if (filters.search) {
      where.OR = [
        { descricao: { contains: filters.search, mode: 'insensitive' } },
        { categoria: { contains: filters.search, mode: 'insensitive' } },
        { subcategoria: { contains: filters.search, mode: 'insensitive' } },
        { estabelecimento: { contains: filters.search, mode: 'insensitive' } },
        { observacoes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const data = await this.prisma.creditCardTransaction.findMany({
      where,
      orderBy: { dataCompra: 'desc' },
    });

    return data.map(item => new CreditCardTransaction(
      item.id,
      item.descricao,
      item.valor.toNumber(),
      item.categoria,
      item.subcategoria,
      item.dataCompra,
      item.parcelas,
      item.parcelaAtual,
      item.estabelecimento,
      item.observacoes,
      item.creditCardId,
      item.invoiceId,
      item.userId,
      item.createdAt,
      item.updatedAt
    ));
  }

  async update(id: string, transaction: CreditCardTransaction): Promise<CreditCardTransaction> {
    const data = await this.prisma.creditCardTransaction.update({
      where: { id },
      data: {
        descricao: transaction.getDescricao(),
        valor: transaction.getValor(),
        categoria: transaction.getCategoria(),
        subcategoria: transaction.getSubcategoria(),
        dataCompra: transaction.getDataCompra(),
        parcelas: transaction.getParcelas(),
        parcelaAtual: transaction.getParcelaAtual(),
        estabelecimento: transaction.getEstabelecimento(),
        observacoes: transaction.getObservacoes(),
        creditCardId: transaction.getCreditCardId(),
        invoiceId: transaction.getInvoiceId(),
        updatedAt: new Date(),
      },
    });

    return new CreditCardTransaction(
      data.id,
      data.descricao,
      data.valor.toNumber(),
      data.categoria,
      data.subcategoria,
      data.dataCompra,
      data.parcelas,
      data.parcelaAtual,
      data.estabelecimento,
      data.observacoes,
      data.creditCardId,
      data.invoiceId,
      data.userId,
      data.createdAt,
      data.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.creditCardTransaction.delete({
      where: { id },
    });
  }

  async findByUserIdAndId(userId: string, id: string): Promise<CreditCardTransaction | null> {
    const data = await this.prisma.creditCardTransaction.findFirst({
      where: { 
        id,
        userId 
      },
    });

    if (!data) {
      return null;
    }

    return new CreditCardTransaction(
      data.id,
      data.descricao,
      data.valor.toNumber(),
      data.categoria,
      data.subcategoria,
      data.dataCompra,
      data.parcelas,
      data.parcelaAtual,
      data.estabelecimento,
      data.observacoes,
      data.creditCardId,
      data.invoiceId,
      data.userId,
      data.createdAt,
      data.updatedAt
    );
  }
}