import { Transaction } from '../../domain/entities/transaction';
import { TransactionRepository } from '../../domain/contracts/transaction-repository';
import { FinancialAccountRepository } from '../../domain/contracts/financial-account-repository';
import { FinancialCategoryRepository } from '../../domain/contracts/financial-category-repository';
import { UserFinanceSettingsRepository } from '../../domain/contracts/user-finance-settings-repository';
import { BudgetService } from '../../domain/services/budget-service';
import { PrismaClient } from '@prisma/client';

export interface CreateTransactionDto {
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa' | 'transferencia';
  categoria?: string;        // Mantido para compatibilidade
  categoriaId?: string;      // Nova FK para FinancialCategory
  subcategoria?: string;
  data: Date;
  observacoes?: string;
  contaFinanceiraId?: string;
  userId: string;
}

export interface TransactionResponseDto {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa' | 'transferencia';
  categoria?: string;        // Mantido para compatibilidade
  categoriaId?: string;      // Nova FK para FinancialCategory
  subcategoria?: string;
  data: string;
  observacoes?: string;
  contaFinanceiraId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class CreateTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly financialAccountRepository: FinancialAccountRepository,
    private readonly financialCategoryRepository: FinancialCategoryRepository,
    private readonly userFinanceSettingsRepository: UserFinanceSettingsRepository,
    private readonly prisma: PrismaClient
  ) {}

  async execute(dto: CreateTransactionDto): Promise<TransactionResponseDto> {
    // Usar transação do banco de dados para garantir consistência
    return await this.prisma.$transaction(async (prismaTransaction) => {
      // Validar dados básicos
      const transaction = Transaction.create({
        descricao: dto.descricao,
        valor: dto.valor,
        tipo: dto.tipo,
        categoria: dto.categoria,
        categoriaId: dto.categoriaId,
        subcategoria: dto.subcategoria,
        data: dto.data,
        observacoes: dto.observacoes,
        contaFinanceiraId: dto.contaFinanceiraId,
        userId: dto.userId
      });

      // Validar conta financeira se fornecida
      if (dto.contaFinanceiraId) {
        const account = await this.financialAccountRepository.findByUserIdAndId(dto.userId, dto.contaFinanceiraId);
        if (!account) {
          throw new Error('Conta financeira não encontrada');
        }

        if (!account.isAtiva()) {
          throw new Error('Conta financeira está inativa');
        }

        // Validar saldo para despesas
        if (transaction.isDespesa()) {
          const saldoAtual = account.getSaldoAtual();
          if (saldoAtual < transaction.getValor()) {
            throw new Error(`Saldo insuficiente. Saldo atual: R$ ${saldoAtual.toFixed(2)}, Valor solicitado: R$ ${transaction.getValor().toFixed(2)}`);
          }
        }
      }

      // Validar orçamento para despesas com categoria
      if (transaction.isDespesa() && (dto.categoria || dto.categoriaId)) {
        const userSettings = await this.userFinanceSettingsRepository.findByUserId(dto.userId);
        
        if (BudgetService.hasValidBudgetSettings(userSettings)) {
          // Buscar categorias do usuário
          const categories = await this.financialCategoryRepository.findByUser(dto.userId);
          
          // Buscar transações do mês atual
          const { startDate, endDate } = BudgetService.getCurrentMonthPeriod();
          const monthTransactions = await this.transactionRepository.findByUserIdAndDateRange(
            dto.userId, 
            startDate, 
            endDate
          );

          // Validar orçamento - usar categoriaId se disponível, senão categoria
          const categoryIdentifier = dto.categoriaId || dto.categoria
          const budgetValidation = BudgetService.validateTransactionBudget(
            transaction.getValor(),
            categoryIdentifier!,
            userSettings!,
            monthTransactions,
            categories,
            startDate,
            endDate
          );

          if (!budgetValidation.isValid) {
            throw new Error(budgetValidation.message || 'Orçamento excedido');
          }
        }
      }

      // Criar a transação
      const savedTransaction = await this.transactionRepository.create(transaction);

      // Atualizar saldo da conta se necessário
      if (dto.contaFinanceiraId) {
        const account = await this.financialAccountRepository.findByUserIdAndId(dto.userId, dto.contaFinanceiraId);
        if (account) {
          if (transaction.isReceita()) {
            account.adicionarValor(transaction.getValor());
          } else if (transaction.isDespesa()) {
            account.subtrairValor(transaction.getValor());
          }
          await this.financialAccountRepository.update(account);
        }
      }

      return this.toResponseDto(savedTransaction);
    });
  }

  private toResponseDto(transaction: Transaction): TransactionResponseDto {
    const id = transaction.getId();
    if (!id) {
      throw new Error('Transaction must have an ID');
    }

    return {
      id,
      descricao: transaction.getDescricao(),
      valor: transaction.getValor(),
      tipo: transaction.getTipo(),
      categoria: transaction.getCategoria(),
      categoriaId: transaction.getCategoriaId(),
      subcategoria: transaction.getSubcategoria(),
      data: transaction.getData().toISOString(),
      observacoes: transaction.getObservacoes(),
      contaFinanceiraId: transaction.getContaFinanceiraId(),
      userId: transaction.getUserId(),
      createdAt: transaction.getCreatedAt().toISOString(),
      updatedAt: transaction.getUpdatedAt().toISOString()
    };
  }
}