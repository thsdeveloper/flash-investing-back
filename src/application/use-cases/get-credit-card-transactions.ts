import { CreditCardTransaction } from '../../domain/entities/credit-card-transaction';
import { CreditCardTransactionRepository } from '../../domain/contracts/credit-card-transaction-repository';
import { CreditCardTransactionResponseDto, CreditCardTransactionListDto, CreditCardTransactionFiltersDto } from '../dtos/credit-card-transaction-dtos';

export class GetCreditCardTransactionsUseCase {
  constructor(
    private readonly creditCardTransactionRepository: CreditCardTransactionRepository
  ) {}

  async execute(userId: string, filters?: CreditCardTransactionFiltersDto): Promise<CreditCardTransactionListDto> {
    let transactions: CreditCardTransaction[];

    if (filters) {
      transactions = await this.creditCardTransactionRepository.findByUserIdWithFilters(userId, filters);
    } else {
      transactions = await this.creditCardTransactionRepository.findByUserId(userId);
    }

    const responseTransactions = transactions.map(transaction => this.toResponseDto(transaction));

    return {
      data: responseTransactions,
      meta: {
        total_count: responseTransactions.length,
        filter_count: responseTransactions.length,
      },
    };
  }

  async findByCreditCardId(creditCardId: string): Promise<CreditCardTransactionResponseDto[]> {
    const transactions = await this.creditCardTransactionRepository.findByCreditCardId(creditCardId);
    return transactions.map(transaction => this.toResponseDto(transaction));
  }

  async findByInvoiceId(invoiceId: string): Promise<CreditCardTransactionResponseDto[]> {
    const transactions = await this.creditCardTransactionRepository.findByInvoiceId(invoiceId);
    return transactions.map(transaction => this.toResponseDto(transaction));
  }

  private toResponseDto(transaction: CreditCardTransaction): CreditCardTransactionResponseDto {
    const id = transaction.getId();
    if (!id) {
      throw new Error('Transaction must have an ID');
    }
    
    return {
      id,
      descricao: transaction.getDescricao(),
      valor: transaction.getValor(),
      categoria: transaction.getCategoria(),
      subcategoria: transaction.getSubcategoria(),
      dataCompra: transaction.getDataCompra().toISOString(),
      parcelas: transaction.getParcelas(),
      parcelaAtual: transaction.getParcelaAtual(),
      estabelecimento: transaction.getEstabelecimento(),
      observacoes: transaction.getObservacoes(),
      creditCardId: transaction.getCreditCardId(),
      invoiceId: transaction.getInvoiceId(),
      userId: transaction.getUserId(),
      createdAt: transaction.getCreatedAt().toISOString(),
      updatedAt: transaction.getUpdatedAt().toISOString(),
      // Campos calculados
      isParcelada: transaction.isParcelada(),
      isUltimaParcela: transaction.isUltimaParcela(),
      parcelaDescricao: transaction.getParcelaDescricao(),
      valorParcela: transaction.getValorParcela(),
      valorTotal: transaction.getValorTotal(),
    };
  }
}