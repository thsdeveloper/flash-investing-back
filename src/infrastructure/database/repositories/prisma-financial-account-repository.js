"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaFinancialAccountRepository = void 0;
const financial_account_1 = require("../../../domain/entities/financial-account");
class PrismaFinancialAccountRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(account) {
        const data = await this.prisma.financialAccount.create({
            data: {
                nome: account.getNome(),
                tipo: account.getTipo(),
                instituicao: account.getInstituicao(),
                saldoInicial: account.getSaldoInicial().toString(),
                saldoAtual: account.getSaldoAtual().toString(),
                cor: account.getCor(),
                icone: account.getIcone(),
                ativa: account.isAtiva(),
                observacoes: account.getObservacoes(),
                userId: account.getUserId(),
            },
        });
        return this.toDomain(data);
    }
    async findById(id) {
        const data = await this.prisma.financialAccount.findUnique({
            where: { id },
        });
        return data ? this.toDomain(data) : null;
    }
    async findByUserId(userId) {
        const data = await this.prisma.financialAccount.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return data.map(item => this.toDomain(item));
    }
    async findByUserIdAndType(userId, type) {
        const data = await this.prisma.financialAccount.findMany({
            where: {
                userId,
                tipo: type,
            },
            orderBy: { createdAt: 'desc' },
        });
        return data.map(item => this.toDomain(item));
    }
    async findActiveByUserId(userId) {
        const data = await this.prisma.financialAccount.findMany({
            where: {
                userId,
                ativa: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return data.map(item => this.toDomain(item));
    }
    async update(account) {
        const data = await this.prisma.financialAccount.update({
            where: { id: account.getId() },
            data: {
                nome: account.getNome(),
                tipo: account.getTipo(),
                instituicao: account.getInstituicao(),
                saldoInicial: account.getSaldoInicial().toString(),
                saldoAtual: account.getSaldoAtual().toString(),
                cor: account.getCor(),
                icone: account.getIcone(),
                ativa: account.isAtiva(),
                observacoes: account.getObservacoes(),
                updatedAt: account.getUpdatedAt(),
            },
        });
        return this.toDomain(data);
    }
    async delete(id) {
        await this.prisma.financialAccount.delete({
            where: { id },
        });
    }
    async softDelete(id) {
        await this.prisma.financialAccount.update({
            where: { id },
            data: { ativa: false },
        });
    }
    toDomain(raw) {
        return new financial_account_1.FinancialAccount({
            id: raw.id,
            nome: raw.nome,
            tipo: raw.tipo,
            instituicao: raw.instituicao,
            saldoInicial: parseFloat(raw.saldoInicial.toString()),
            saldoAtual: parseFloat(raw.saldoAtual.toString()),
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
exports.PrismaFinancialAccountRepository = PrismaFinancialAccountRepository;
