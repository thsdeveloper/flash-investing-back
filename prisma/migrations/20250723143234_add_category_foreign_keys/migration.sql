-- CreateEnum
CREATE TYPE "category_types" AS ENUM ('receita', 'despesa');

-- CreateEnum
CREATE TYPE "category_rules" AS ENUM ('necessidades', 'desejos', 'futuro');

-- CreateEnum
CREATE TYPE "category_status" AS ENUM ('published', 'draft', 'archived');

-- AlterTable
ALTER TABLE "credit_card_transactions" ADD COLUMN     "categoriaId" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "categoriaId" TEXT;

-- CreateTable
CREATE TABLE "user_finance_settings" (
    "id" TEXT NOT NULL,
    "salary" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "fixed" INTEGER NOT NULL DEFAULT 50,
    "variable" INTEGER NOT NULL DEFAULT 30,
    "investments" INTEGER NOT NULL DEFAULT 20,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_finance_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_categories" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "icone" TEXT,
    "cor" TEXT,
    "tipo" "category_types" NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "rule_category" "category_rules",
    "sort" INTEGER DEFAULT 0,
    "status" "category_status" NOT NULL DEFAULT 'published',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_finance_settings_userId_key" ON "user_finance_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "financial_categories_userId_nome_key" ON "financial_categories"("userId", "nome");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "financial_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_transactions" ADD CONSTRAINT "credit_card_transactions_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "financial_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_finance_settings" ADD CONSTRAINT "user_finance_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_categories" ADD CONSTRAINT "financial_categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
