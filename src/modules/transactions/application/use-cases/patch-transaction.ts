import { FinancialAccountRepository } from '@src/modules/financial-accounts/domain/contracts/financial-account-repository';
import { FinancialCategoryRepository } from '@src/modules/financial-categories/domain/contracts/financial-category-repository';
import { UserFinanceSettingsRepository } from '@src/modules/user-finance-settings/domain/contracts/user-finance-settings-repository';
import { BudgetService } from '@src/modules/shared/domain/services/budget-service';
import { PrismaClient } from '@prisma/client';
import {TransactionRepository} from "@src/modules/transactions/domain/contracts/transaction-repository";
import {Transaction} from "@src/modules/transactions/domain/entities/transaction";

export interface PatchTransactionDto {
  id: string;
  descricao?: string;
  valor?: number;
  tipo?: 'receita' | 'despesa' | 'transferencia';
  categoria?: string;
  categoriaId?: string;
  subcategoria?: string;
  data?: Date;
  status?: 'pending' | 'completed';
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
  categoriaId?: string;
  subcategoria?: string;
  data: string;
  status: 'pending' | 'completed';
  observacoes?: string;
  contaFinanceiraId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class PatchTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly financialAccountRepository: FinancialAccountRepository,
    private readonly financialCategoryRepository: FinancialCategoryRepository,
    private readonly userFinanceSettingsRepository: UserFinanceSettingsRepository,
    private readonly prisma: PrismaClient
  ) {}

  async execute(dto: PatchTransactionDto): Promise<TransactionResponseDto> {
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

      // Capturar estado atual antes das mudanças
      const oldStatus = currentTransaction.getStatus();
      const oldValue = currentTransaction.getValor();
      const oldType = currentTransaction.getTipo();
      const oldAccountId = currentTransaction.getContaFinanceiraId();

      // Aplicar mudanças nos campos fornecidos
      if (dto.descricao !== undefined) {
        currentTransaction.updateDescricao(dto.descricao);
      }
      if (dto.valor !== undefined) {
        currentTransaction.updateValor(dto.valor);
      }
      if (dto.tipo !== undefined) {
        // Tipo não pode ser mudado se transação estiver completed
        if (currentTransaction.isCompleted() && dto.tipo !== oldType) {
          throw new Error('Não é possível alterar o tipo de uma transação já efetuada');
        }
        currentTransaction.updateTipo(dto.tipo);
      }
      if (dto.categoria !== undefined) {
        currentTransaction.updateCategoria(dto.categoria);
      }
      if (dto.categoriaId !== undefined) {
        currentTransaction.updateCategoriaId(dto.categoriaId);
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
      if (dto.status !== undefined) {
        currentTransaction.updateStatus(dto.status);
      }

      // Capturar novo estado após mudanças
      const newStatus = currentTransaction.getStatus();
      const newValue = currentTransaction.getValor();
      const newType = currentTransaction.getTipo();
      const newAccountId = currentTransaction.getContaFinanceiraId();

      // Validar nova conta financeira se mudou
      if (dto.contaFinanceiraId !== undefined && newAccountId) {
        const account = await this.financialAccountRepository.findByUserIdAndId(
          dto.userId,
          newAccountId
        );
        if (!account) {
          throw new Error('Conta financeira não encontrada');
        }
        if (!account.isAtiva()) {
          throw new Error('Conta financeira está inativa');
        }
      }

      // Validar orçamento para despesas se categoria mudou
      if ((dto.categoria !== undefined || dto.categoriaId !== undefined) && 
          currentTransaction.isDespesa() && 
          (currentTransaction.getCategoria() || currentTransaction.getCategoriaId())) {
        
        const userSettings = await this.userFinanceSettingsRepository.findByUserId(dto.userId);
        
        if (BudgetService.hasValidBudgetSettings(userSettings)) {
          const categories = await this.financialCategoryRepository.findByUser(dto.userId);
          const { startDate, endDate } = BudgetService.getCurrentMonthPeriod();
          const monthTransactions = await this.transactionRepository.findByUserIdAndDateRange(
            dto.userId, 
            startDate, 
            endDate
          );

          const filteredTransactions = monthTransactions.filter(t => t.getId() !== dto.id);
          const categoryIdentifier = currentTransaction.getCategoriaId() || currentTransaction.getCategoria();
          
          const budgetValidation = BudgetService.validateTransactionBudget(
            currentTransaction.getValor(),
            categoryIdentifier!,
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

      // Lógica inteligente de atualização de saldo baseada nas mudanças
      await this.handleBalanceChanges(
        dto.userId,
        oldStatus,
        newStatus,
        oldValue,
        newValue,
        oldType,
        newType,
        oldAccountId,
        newAccountId
      );

      // Salvar a transação atualizada
      const savedTransaction = await this.transactionRepository.update(currentTransaction);

      return this.toResponseDto(savedTransaction);
    });
  }

  private async handleBalanceChanges(
    userId: string,
    oldStatus: 'pending' | 'completed',
    newStatus: 'pending' | 'completed',
    oldValue: number,
    newValue: number,
    oldType: 'receita' | 'despesa' | 'transferencia',
    newType: 'receita' | 'despesa' | 'transferencia',
    oldAccountId?: string,
    newAccountId?: string
  ): Promise<void> {
    
    // Cenário 1: Status mudou de completed → pending
    if (oldStatus === 'completed' && newStatus === 'pending') {
      if (oldAccountId) {
        await this.revertBalance(userId, oldAccountId, oldValue, oldType);
      }
      return;
    }

    // Cenário 2: Status mudou de pending → completed
    if (oldStatus === 'pending' && newStatus === 'completed') {
      if (newAccountId) {
        await this.applyBalance(userId, newAccountId, newValue, newType);
      }
      return;
    }

    // Cenário 3: Transação já completed, mas mudaram valor/conta/tipo
    if (oldStatus === 'completed' && newStatus === 'completed') {
      // Reverter efeito antigo
      if (oldAccountId) {
        await this.revertBalance(userId, oldAccountId, oldValue, oldType);
      }
      
      // Aplicar novo efeito
      if (newAccountId) {
        await this.applyBalance(userId, newAccountId, newValue, newType);
      }
      return;
    }

    // Cenário 4: Transação pending permanece pending
    // Não afeta saldo, nada a fazer
  }

  private async revertBalance(
    userId: string,
    accountId: string,
    value: number,
    type: 'receita' | 'despesa' | 'transferencia'
  ): Promise<void> {
    const account = await this.financialAccountRepository.findByUserIdAndId(userId, accountId);
    if (!account) return;

    // Reverter: receita vira subtração, despesa vira adição
    if (type === 'receita') {
      account.subtrairValor(value);
    } else if (type === 'despesa') {
      account.adicionarValor(value);
    }
    
    await this.financialAccountRepository.update(account);
  }

  private async applyBalance(
    userId: string,
    accountId: string,
    value: number,
    type: 'receita' | 'despesa' | 'transferencia'
  ): Promise<void> {
    const account = await this.financialAccountRepository.findByUserIdAndId(userId, accountId);
    if (!account) {
      throw new Error('Conta financeira não encontrada');
    }

    if (!account.isAtiva()) {
      throw new Error('Conta financeira está inativa');
    }

    // Validar saldo para despesas
    if (type === 'despesa') {
      const saldoAtual = account.getSaldoAtual();
      if (saldoAtual < value) {
        throw new Error(`Saldo insuficiente. Saldo atual: R$ ${saldoAtual.toFixed(2)}, Valor solicitado: R$ ${value.toFixed(2)}`);
      }
    }

    // Aplicar: receita soma, despesa subtrai
    if (type === 'receita') {
      account.adicionarValor(value);
    } else if (type === 'despesa') {
      account.subtrairValor(value);
    }
    
    await this.financialAccountRepository.update(account);
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
      status: transaction.getStatus(),
      observacoes: transaction.getObservacoes(),
      contaFinanceiraId: transaction.getContaFinanceiraId(),
      userId: transaction.getUserId(),
      createdAt: transaction.getCreatedAt().toISOString(),
      updatedAt: transaction.getUpdatedAt().toISOString()
    };
  }
}