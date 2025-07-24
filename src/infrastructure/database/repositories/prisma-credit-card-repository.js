"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCreditCardRepository = void 0;
const credit_card_1 = require("../../../domain/entities/credit-card");
class PrismaCreditCardRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(creditCard) {
        const created = await this.prisma.creditCard.create({
            data: {
                nome: creditCard.getNome(),
                bandeira: creditCard.getBandeira(),
                ultimosDigitos: creditCard.getUltimosDigitos(),
                limiteTotal: creditCard.getLimiteTotal(),
                limiteDisponivel: creditCard.getLimiteDisponivel(),
                diaVencimento: creditCard.getDiaVencimento(),
                diaFechamento: creditCard.getDiaFechamento(),
                banco: creditCard.getBanco(),
                cor: creditCard.getCor(),
                ativo: creditCard.isAtivo(),
                observacoes: creditCard.getObservacoes(),
                userId: creditCard.getUserId(),
            },
        });
        return this.toDomain(created);
    }
    async findById(id) {
        const creditCard = await this.prisma.creditCard.findUnique({
            where: { id },
        });
        return creditCard ? this.toDomain(creditCard) : null;
    }
    async findByUserId(userId) {
        const creditCards = await this.prisma.creditCard.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return creditCards.map(card => this.toDomain(card));
    }
    async findActiveByUserId(userId) {
        const creditCards = await this.prisma.creditCard.findMany({
            where: {
                userId,
                ativo: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return creditCards.map(card => this.toDomain(card));
    }
    async update(id, creditCard) {
        const updateData = {};
        if (creditCard.getNome)
            updateData.nome = creditCard.getNome();
        if (creditCard.getBandeira)
            updateData.bandeira = creditCard.getBandeira();
        if (creditCard.getUltimosDigitos)
            updateData.ultimosDigitos = creditCard.getUltimosDigitos();
        if (creditCard.getLimiteTotal)
            updateData.limiteTotal = creditCard.getLimiteTotal();
        if (creditCard.getLimiteDisponivel)
            updateData.limiteDisponivel = creditCard.getLimiteDisponivel();
        if (creditCard.getDiaVencimento)
            updateData.diaVencimento = creditCard.getDiaVencimento();
        if (creditCard.getDiaFechamento)
            updateData.diaFechamento = creditCard.getDiaFechamento();
        if (creditCard.getBanco !== undefined)
            updateData.banco = creditCard.getBanco();
        if (creditCard.getCor !== undefined)
            updateData.cor = creditCard.getCor();
        if (creditCard.isAtivo !== undefined)
            updateData.ativo = creditCard.isAtivo();
        if (creditCard.getObservacoes !== undefined)
            updateData.observacoes = creditCard.getObservacoes();
        const updated = await this.prisma.creditCard.update({
            where: { id },
            data: updateData,
        });
        return this.toDomain(updated);
    }
    async delete(id) {
        await this.prisma.creditCard.delete({
            where: { id },
        });
    }
    async findByUserIdAndLastDigits(userId, lastDigits) {
        const creditCards = await this.prisma.creditCard.findMany({
            where: {
                userId,
                ultimosDigitos: lastDigits,
            },
        });
        return creditCards.map(card => this.toDomain(card));
    }
    toDomain(data) {
        return new credit_card_1.CreditCard({
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
            userId: data.userId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }
}
exports.PrismaCreditCardRepository = PrismaCreditCardRepository;
