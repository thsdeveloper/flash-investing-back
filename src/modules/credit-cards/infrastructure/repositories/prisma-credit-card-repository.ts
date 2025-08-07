import { PrismaClient } from '@prisma/client';
import {CreditCard} from "@src/modules/credit-cards/domain/entities/credit-card";
import {CreditCardRepository} from "@src/modules/credit-cards/domain/contracts/credit-card-repository";

export class PrismaCreditCardRepository implements CreditCardRepository {
  constructor(private prisma: PrismaClient) {}

  async create(creditCard: CreditCard): Promise<CreditCard> {
    const created = await this.prisma.creditCard.create({
      data: {
        nome: creditCard.getNome(),
        bandeira: creditCard.getBandeira() as any,
        ultimosDigitos: creditCard.getUltimosDigitos(),
        limiteTotal: creditCard.getLimiteTotal(),
        limiteDisponivel: creditCard.getLimiteDisponivel(),
        diaVencimento: creditCard.getDiaVencimento(),
        diaFechamento: creditCard.getDiaFechamento(),
        banco: creditCard.getBanco(),
        cor: creditCard.getCor(),
        ativo: creditCard.isAtivo(),
        observacoes: creditCard.getObservacoes(),
        contaFinanceiraId: creditCard.getContaFinanceiraId(),
        userId: creditCard.getUserId(),
      },
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<CreditCard | null> {
    const creditCard = await this.prisma.creditCard.findUnique({
      where: { id },
    });

    return creditCard ? this.toDomain(creditCard) : null;
  }

  async findByUserId(userId: string): Promise<CreditCard[]> {
    const creditCards = await this.prisma.creditCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return creditCards.map(card => this.toDomain(card));
  }

  async findActiveByUserId(userId: string): Promise<CreditCard[]> {
    const creditCards = await this.prisma.creditCard.findMany({
      where: { 
        userId,
        ativo: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return creditCards.map(card => this.toDomain(card));
  }

  async update(id: string, creditCard: Partial<CreditCard>): Promise<CreditCard> {
    const updateData: any = {};

    if (creditCard.getNome) updateData.nome = creditCard.getNome();
    if (creditCard.getBandeira) updateData.bandeira = creditCard.getBandeira();
    if (creditCard.getUltimosDigitos) updateData.ultimosDigitos = creditCard.getUltimosDigitos();
    if (creditCard.getLimiteTotal) updateData.limiteTotal = creditCard.getLimiteTotal();
    if (creditCard.getLimiteDisponivel) updateData.limiteDisponivel = creditCard.getLimiteDisponivel();
    if (creditCard.getDiaVencimento) updateData.diaVencimento = creditCard.getDiaVencimento();
    if (creditCard.getDiaFechamento) updateData.diaFechamento = creditCard.getDiaFechamento();
    if (creditCard.getBanco !== undefined) updateData.banco = creditCard.getBanco();
    if (creditCard.getCor !== undefined) updateData.cor = creditCard.getCor();
    if (creditCard.isAtivo !== undefined) updateData.ativo = creditCard.isAtivo();
    if (creditCard.getObservacoes !== undefined) updateData.observacoes = creditCard.getObservacoes();
    if (creditCard.getContaFinanceiraId) updateData.contaFinanceiraId = creditCard.getContaFinanceiraId();

    const updated = await this.prisma.creditCard.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.creditCard.delete({
      where: { id },
    });
  }

  async findByUserIdAndLastDigits(userId: string, lastDigits: string): Promise<CreditCard[]> {
    const creditCards = await this.prisma.creditCard.findMany({
      where: {
        userId,
        ultimosDigitos: lastDigits,
      },
    });

    return creditCards.map(card => this.toDomain(card));
  }

  async findByUserIdAndId(userId: string, id: string): Promise<CreditCard | null> {
    const creditCard = await this.prisma.creditCard.findFirst({
      where: {
        id,
        userId,
      },
    });

    return creditCard ? this.toDomain(creditCard) : null;
  }

  async findByFinancialAccountId(financialAccountId: string): Promise<CreditCard[]> {
    const creditCards = await this.prisma.creditCard.findMany({
      where: { contaFinanceiraId: financialAccountId },
      orderBy: { createdAt: 'desc' },
    });

    return creditCards.map(card => this.toDomain(card));
  }

  async countByFinancialAccountId(financialAccountId: string): Promise<number> {
    return await this.prisma.creditCard.count({
      where: { contaFinanceiraId: financialAccountId },
    });
  }

  private toDomain(data: any): CreditCard {
    return new CreditCard({
      id: data.id,
      nome: data.nome,
      bandeira: data.bandeira,
      ultimosDigitos: data.ultimosDigitos,
      limiteTotal: parseFloat(data.limiteTotal.toString()),
      limiteDisponivel: parseFloat(data.limiteDisponivel.toString()),
      diaVencimento: data.diaVencimento,
      diaFechamento: data.diaFechamento,
      banco: data.banco,
      cor: data.cor,
      ativo: data.ativo,
      observacoes: data.observacoes,
      contaFinanceiraId: data.contaFinanceiraId,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}