-- CreateEnum
CREATE TYPE "transaction_status" AS ENUM ('pending', 'completed');

-- CreateEnum
CREATE TYPE "debt_types" AS ENUM ('cartao_credito', 'emprestimo_pessoal', 'financiamento', 'cheque_especial', 'outros');

-- CreateEnum
CREATE TYPE "debt_status" AS ENUM ('ativa', 'quitada', 'em_negociacao', 'vencida');

-- CreateEnum
CREATE TYPE "debt_payment_types" AS ENUM ('pagamento_parcial', 'quitacao_total');

-- CreateEnum
CREATE TYPE "debt_negotiation_status" AS ENUM ('pendente', 'aceita', 'rejeitada', 'em_andamento');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "status" "transaction_status" NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "debts" (
    "id" TEXT NOT NULL,
    "credor" TEXT NOT NULL,
    "tipo_divida" "debt_types" NOT NULL,
    "valor_original" DECIMAL(65,30) NOT NULL,
    "valor_atual" DECIMAL(65,30) NOT NULL,
    "taxa_juros" DECIMAL(65,30),
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "status" "debt_status" NOT NULL DEFAULT 'ativa',
    "descricao" TEXT,
    "parcelas_total" INTEGER,
    "valor_parcela" DECIMAL(65,30),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_payments" (
    "id" TEXT NOT NULL,
    "debt_id" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "data_pagamento" TIMESTAMP(3) NOT NULL,
    "tipo" "debt_payment_types" NOT NULL,
    "observacoes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_negotiations" (
    "id" TEXT NOT NULL,
    "debt_id" TEXT NOT NULL,
    "data_negociacao" TIMESTAMP(3) NOT NULL,
    "proposta" TEXT NOT NULL,
    "status" "debt_negotiation_status" NOT NULL,
    "observacoes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_negotiations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "debts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_negotiations" ADD CONSTRAINT "debt_negotiations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_negotiations" ADD CONSTRAINT "debt_negotiations_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "debts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
