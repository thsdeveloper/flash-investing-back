"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const user_1 = require("../../../domain/entities/user");
const email_1 = require("../../../domain/value-objects/email");
const password_1 = require("../../../domain/value-objects/password");
class PrismaUserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(user) {
        const data = await this.prisma.user.create({
            data: {
                name: user.getName(),
                email: user.getEmail().getValue(),
                password: user.getPassword().getValue(),
            },
        });
        return this.toDomain(data);
    }
    async findByEmail(email) {
        const data = await this.prisma.user.findUnique({
            where: {
                email: email.getValue(),
            },
        });
        return data ? this.toDomain(data) : null;
    }
    async findById(id) {
        const data = await this.prisma.user.findUnique({
            where: { id },
        });
        return data ? this.toDomain(data) : null;
    }
    async update(user) {
        const data = await this.prisma.user.update({
            where: { id: user.getId() },
            data: {
                name: user.getName(),
                email: user.getEmail().getValue(),
                password: user.getPassword().getValue(),
            },
        });
        return this.toDomain(data);
    }
    async delete(id) {
        await this.prisma.user.delete({
            where: { id },
        });
    }
    toDomain(raw) {
        return new user_1.User({
            id: raw.id,
            name: raw.name,
            email: new email_1.Email(raw.email),
            password: password_1.Password.fromHash(raw.password),
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
