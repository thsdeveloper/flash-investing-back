-- CreateEnum
CREATE TYPE "financial_account_types" AS ENUM ('conta_corrente', 'conta_poupanca', 'carteira', 'investimento', 'outras');

-- CreateEnum
CREATE TYPE "transaction_types" AS ENUM ('receita', 'despesa', 'transferencia');

-- CreateEnum
CREATE TYPE "credit_card_brands" AS ENUM ('visa', 'mastercard', 'elo', 'american_express', 'diners', 'hipercard', 'outros');

-- CreateEnum
CREATE TYPE "invoice_status" AS ENUM ('aberta', 'fechada', 'vencida', 'paga', 'paga_parcial');

-- CreateTable
CREATE TABLE "financial_accounts" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "financial_account_types" NOT NULL,
    "instituicao" TEXT,
    "saldoInicial" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "saldoAtual" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cor" TEXT,
    "icone" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "tipo" "transaction_types" NOT NULL,
    "categoria" TEXT,
    "subcategoria" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,
    "contaFinanceiraId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_transfers" (
    "id" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "descricao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "contaOrigemId" TEXT NOT NULL,
    "contaDestinoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_cards" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "bandeira" "credit_card_brands" NOT NULL,
    "ultimos_digitos" TEXT NOT NULL,
    "limite_total" DECIMAL(65,30) NOT NULL,
    "limite_disponivel" DECIMAL(65,30) NOT NULL,
    "dia_vencimento" INTEGER NOT NULL,
    "dia_fechamento" INTEGER NOT NULL,
    "banco" TEXT,
    "cor" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "conta_financeira_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_card_invoices" (
    "id" TEXT NOT NULL,
    "credit_card_id" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "valor_total" DECIMAL(65,30) NOT NULL,
    "valor_pago" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "data_fechamento" TIMESTAMP(3) NOT NULL,
    "status" "invoice_status" NOT NULL,
    "observacoes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_card_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_card_transactions" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "categoria" TEXT,
    "subcategoria" TEXT,
    "data_compra" TIMESTAMP(3) NOT NULL,
    "parcelas" INTEGER NOT NULL DEFAULT 1,
    "parcela_atual" INTEGER NOT NULL DEFAULT 1,
    "estabelecimento" TEXT,
    "observacoes" TEXT,
    "credit_card_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_card_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credit_card_invoices_credit_card_id_mes_ano_key" ON "credit_card_invoices"("credit_card_id", "mes", "ano");

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_contaFinanceiraId_fkey" FOREIGN KEY ("contaFinanceiraId") REFERENCES "financial_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_transfers" ADD CONSTRAINT "account_transfers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_transfers" ADD CONSTRAINT "account_transfers_contaOrigemId_fkey" FOREIGN KEY ("contaOrigemId") REFERENCES "financial_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_transfers" ADD CONSTRAINT "account_transfers_contaDestinoId_fkey" FOREIGN KEY ("contaDestinoId") REFERENCES "financial_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_conta_financeira_id_fkey" FOREIGN KEY ("conta_financeira_id") REFERENCES "financial_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_invoices" ADD CONSTRAINT "credit_card_invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_invoices" ADD CONSTRAINT "credit_card_invoices_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_transactions" ADD CONSTRAINT "credit_card_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_transactions" ADD CONSTRAINT "credit_card_transactions_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_transactions" ADD CONSTRAINT "credit_card_transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "credit_card_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
