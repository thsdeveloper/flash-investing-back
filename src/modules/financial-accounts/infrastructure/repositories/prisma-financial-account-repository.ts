import { PrismaClient, FinancialAccountType as PrismaFinancialAccountType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  FinancialAccountRepository
} from "@src/modules/financial-accounts/domain/contracts/financial-account-repository";
import {
  FinancialAccount,
  FinancialAccountType
} from "@src/modules/financial-accounts/domain/entities/financial-account";

export class PrismaFinancialAccountRepository implements FinancialAccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(account: FinancialAccount): Promise<FinancialAccount> {
    const data = await this.prisma.financialAccount.create({
      data: {
        nome: account.getNome(),
        tipo: account.getTipo() as PrismaFinancialAccountType,
        instituicao: account.getInstituicao(),
        saldoInicial: new Decimal(account.getSaldoInicial()),
        saldoAtual: new Decimal(account.getSaldoAtual()),
        cor: account.getCor(),
        icone: account.getIcone(),
        ativa: account.isAtiva(),
        observacoes: account.getObservacoes(),
        userId: account.getUserId(),
      },
    });

    return this.toDomain(data);
  }

  async findById(id: string): Promise<FinancialAccount | null> {
    const data = await this.prisma.financialAccount.findUnique({
      where: { id },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByUserId(userId: string): Promise<FinancialAccount[]> {
    const data = await this.prisma.financialAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return data.map(item => this.toDomain(item));
  }

  async findByUserIdAndType(userId: string, type: FinancialAccountType): Promise<FinancialAccount[]> {
    const data = await this.prisma.financialAccount.findMany({
      where: { 
        userId,
        tipo: type as PrismaFinancialAccountType,
      },
      orderBy: { createdAt: 'desc' },
    });

    return data.map(item => this.toDomain(item));
  }

  async findActiveByUserId(userId: string): Promise<FinancialAccount[]> {
    const data = await this.prisma.financialAccount.findMany({
      where: { 
        userId,
        ativa: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return data.map(item => this.toDomain(item));
  }

  async update(account: FinancialAccount): Promise<FinancialAccount> {
    const data = await this.prisma.financialAccount.update({
      where: { id: account.getId() },
      data: {
        nome: account.getNome(),
        tipo: account.getTipo() as PrismaFinancialAccountType,
        instituicao: account.getInstituicao(),
        saldoInicial: new Decimal(account.getSaldoInicial()),
        saldoAtual: new Decimal(account.getSaldoAtual()),
        cor: account.getCor(),
        icone: account.getIcone(),
        ativa: account.isAtiva(),
        observacoes: account.getObservacoes(),
        updatedAt: account.getUpdatedAt(),
      },
    });

    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.financialAccount.delete({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.financialAccount.update({
      where: { id },
      data: { ativa: false },
    });
  }

  async findByUserIdAndId(userId: string, id: string): Promise<FinancialAccount | null> {
    const data = await this.prisma.financialAccount.findFirst({
      where: { 
        id,
        userId,
      },
    });

    return data ? this.toDomain(data) : null;
  }

  async updateSaldo(id: string, novoSaldo: number): Promise<void> {
    await this.prisma.financialAccount.update({
      where: { id },
      data: { 
        saldoAtual: new Decimal(novoSaldo),
        updatedAt: new Date()
      },
    });
  }

  private toDomain(raw: any): FinancialAccount {
    return new FinancialAccount({
      id: raw.id,
      nome: raw.nome,
      tipo: raw.tipo as FinancialAccountType,
      instituicao: raw.instituicao,
      saldoInicial: raw.saldoInicial.toNumber(),
      saldoAtual: raw.saldoAtual.toNumber(),
      cor: raw.cor,
      icone: raw.icone,
      ativa: raw.ativa,
      observacoes: raw.observacoes,
      userId: raw.userId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}