import { CreditCardTransactionRepository } from '@src/modules/credit-cards/domain/contracts/credit-card-transaction-repository';
import {CreditCardTransaction} from "@src/modules/credit-cards/domain/entities/credit-card-transaction";
import {
  CreditCardTransactionResponseDto
} from "@src/modules/credit-cards/application/dtos/credit-card-transaction-dtos";

export class GetCreditCardTransactionByIdUseCase {
  constructor(
    private readonly creditCardTransactionRepository: CreditCardTransactionRepository
  ) {}

  async execute(userId: string, transactionId: string): Promise<CreditCardTransactionResponseDto> {
    const transaction = await this.creditCardTransactionRepository.findByUserIdAndId(userId, transactionId);
    
    if (!transaction) {
      throw new Error('Transação de cartão de crédito não encontrada');
    }

    return this.toResponseDto(transaction);
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
      categoria: transaction.getCategoria() || null,
      subcategoria: transaction.getSubcategoria() || null,
      dataCompra: transaction.getDataCompra().toISOString(),
      parcelas: transaction.getParcelas(),
      parcelaAtual: transaction.getParcelaAtual(),
      estabelecimento: transaction.getEstabelecimento() || null,
      observacoes: transaction.getObservacoes() || null,
      creditCardId: transaction.getCreditCardId(),
      invoiceId: transaction.getInvoiceId() || null,
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