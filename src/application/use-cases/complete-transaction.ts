import { Transaction } from '../../domain/entities/transaction';
import { TransactionRepository } from '../../domain/contracts/transaction-repository';
import { FinancialAccountRepository } from '../../domain/contracts/financial-account-repository';
import { PrismaClient } from '@prisma/client';

export interface CompleteTransactionDto {
  id: string;
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

export class CompleteTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly financialAccountRepository: FinancialAccountRepository,
    private readonly prisma: PrismaClient
  ) {}

  async execute(dto: CompleteTransactionDto): Promise<TransactionResponseDto> {
    // Usar transação do banco de dados para garantir consistência
    return await this.prisma.$transaction(async (prismaTransaction) => {
      // Buscar a transação
      const transaction = await this.transactionRepository.findById(dto.id);
      if (!transaction) {
        throw new Error('Transação não encontrada');
      }

      // Verificar se a transação pertence ao usuário
      if (!transaction.belongsToUser(dto.userId)) {
        throw new Error('Transação não pertence ao usuário');
      }

      // Verificar se a transação já não está completed
      if (transaction.isCompleted()) {
        throw new Error('Transação já está marcada como efetuada');
      }

      // Marcar como completed
      transaction.markAsCompleted();

      // Atualizar saldo da conta se necessário
      const contaFinanceiraId = transaction.getContaFinanceiraId();
      if (contaFinanceiraId) {
        const account = await this.financialAccountRepository.findByUserIdAndId(
          dto.userId,
          contaFinanceiraId
        );
        
        if (account) {
          // Verificar se a conta está ativa
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

          // Aplicar alteração no saldo
          if (transaction.isReceita()) {
            account.adicionarValor(transaction.getValor());
          } else if (transaction.isDespesa()) {
            account.subtrairValor(transaction.getValor());
          }
          
          // Salvar a conta atualizada
          await this.financialAccountRepository.update(account);
        }
      }

      // Salvar a transação atualizada
      const savedTransaction = await this.transactionRepository.update(transaction);

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
      status: transaction.getStatus(),
      observacoes: transaction.getObservacoes(),
      contaFinanceiraId: transaction.getContaFinanceiraId(),
      userId: transaction.getUserId(),
      createdAt: transaction.getCreatedAt().toISOString(),
      updatedAt: transaction.getUpdatedAt().toISOString()
    };
  }
}