import { Transaction } from '../../domain/entities/transaction';
import { TransactionRepository } from '../../domain/contracts/transaction-repository';
import { FinancialAccountRepository } from '../../domain/contracts/financial-account-repository';
import { FinancialCategoryRepository } from '../../domain/contracts/financial-category-repository';
import { UserFinanceSettingsRepository } from '../../domain/contracts/user-finance-settings-repository';
import { BudgetService } from '../../domain/services/budget-service';
import { PrismaClient } from '@prisma/client';

export interface UpdateTransactionDto {
  id: string;
  descricao?: string;
  valor?: number;
  tipo?: 'receita' | 'despesa' | 'transferencia';
  categoria?: string;
  subcategoria?: string;
  data?: Date;
  observacoes?: string;
  contaFinanceiraId?: string;
  userId: string;
}

export interface TransactionResponseDto {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa' | 'transferencia';
  categoria?: string;
  subcategoria?: string;
  data: string;
  observacoes?: string;
  contaFinanceiraId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class UpdateTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly financialAccountRepository: FinancialAccountRepository,
    private readonly financialCategoryRepository: FinancialCategoryRepository,
    private readonly userFinanceSettingsRepository: UserFinanceSettingsRepository,
    private readonly prisma: PrismaClient
  ) {}

  async execute(dto: UpdateTransactionDto): Promise<TransactionResponseDto> {
    // Usar transação do banco de dados para garantir consistência
    return await this.prisma.$transaction(async (prismaTransaction) => {
      // Buscar a transação atual
      const currentTransaction = await this.transactionRepository.findById(dto.id);
      if (!currentTransaction) {
        throw new Error('Transação não encontrada');
      }

      // Verificar se a transação pertence ao usuário
      if (!currentTransaction.belongsToUser(dto.userId)) {
        throw new Error('Transação não pertence ao usuário');
      }

      // Reverter o efeito da transação atual no saldo da conta
      const currentAccountId = currentTransaction.getContaFinanceiraId();
      if (currentAccountId) {
        const currentAccount = await this.financialAccountRepository.findByUserIdAndId(
          dto.userId,
          currentAccountId
        );
        if (currentAccount) {
          if (currentTransaction.isReceita()) {
            currentAccount.subtrairValor(currentTransaction.getValor());
          } else if (currentTransaction.isDespesa()) {
            currentAccount.adicionarValor(currentTransaction.getValor());
          }
          await this.financialAccountRepository.update(currentAccount);
        }
      }

      // Aplicar as atualizações
      if (dto.descricao !== undefined) {
        currentTransaction.updateDescricao(dto.descricao);
      }
      if (dto.valor !== undefined) {
        currentTransaction.updateValor(dto.valor);
      }
      if (dto.categoria !== undefined) {
        currentTransaction.updateCategoria(dto.categoria);
      }
      if (dto.subcategoria !== undefined) {
        currentTransaction.updateSubcategoria(dto.subcategoria);
      }
      if (dto.data !== undefined) {
        currentTransaction.updateData(dto.data);
      }
      if (dto.observacoes !== undefined) {
        currentTransaction.updateObservacoes(dto.observacoes);
      }
      if (dto.contaFinanceiraId !== undefined) {
        currentTransaction.updateContaFinanceira(dto.contaFinanceiraId);
      }

      // Validar nova conta financeira se fornecida
      const updatedAccountId = currentTransaction.getContaFinanceiraId();
      if (updatedAccountId) {
        const account = await this.financialAccountRepository.findByUserIdAndId(
          dto.userId,
          updatedAccountId
        );
        if (!account) {
          throw new Error('Conta financeira não encontrada');
        }

        if (!account.isAtiva()) {
          throw new Error('Conta financeira está inativa');
        }

        // Validar saldo para despesas
        if (currentTransaction.isDespesa()) {
          const saldoAtual = account.getSaldoAtual();
          if (saldoAtual < currentTransaction.getValor()) {
            throw new Error(`Saldo insuficiente. Saldo atual: R$ ${saldoAtual.toFixed(2)}, Valor solicitado: R$ ${currentTransaction.getValor().toFixed(2)}`);
          }
        }
      }

      // Validar orçamento para despesas com categoria
      if (currentTransaction.isDespesa() && currentTransaction.getCategoria()) {
        const userSettings = await this.userFinanceSettingsRepository.findByUserId(dto.userId);
        
        if (BudgetService.hasValidBudgetSettings(userSettings)) {
          // Buscar categorias do usuário
          const categories = await this.financialCategoryRepository.findByUser(dto.userId);
          
          // Buscar transações do mês atual (excluindo a atual)
          const { startDate, endDate } = BudgetService.getCurrentMonthPeriod();
          const monthTransactions = await this.transactionRepository.findByUserIdAndDateRange(
            dto.userId, 
            startDate, 
            endDate
          );

          // Filtrar a transação atual das transações do mês
          const filteredTransactions = monthTransactions.filter(t => t.getId() !== dto.id);

          // Validar orçamento
          const budgetValidation = BudgetService.validateTransactionBudget(
            currentTransaction.getValor(),
            currentTransaction.getCategoria()!,
            userSettings!,
            filteredTransactions,
            categories,
            startDate,
            endDate
          );

          if (!budgetValidation.isValid) {
            throw new Error(budgetValidation.message || 'Orçamento excedido');
          }
        }
      }

      // Salvar a transação atualizada
      const savedTransaction = await this.transactionRepository.update(currentTransaction);

      // Aplicar o novo efeito no saldo da conta
      const finalAccountId = currentTransaction.getContaFinanceiraId();
      if (finalAccountId) {
        const account = await this.financialAccountRepository.findByUserIdAndId(
          dto.userId,
          finalAccountId
        );
        if (account) {
          if (currentTransaction.isReceita()) {
            account.adicionarValor(currentTransaction.getValor());
          } else if (currentTransaction.isDespesa()) {
            account.subtrairValor(currentTransaction.getValor());
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