import { CreditCardTransaction } from '../../domain/entities/credit-card-transaction';
import { CreditCardTransactionRepository } from '../../domain/contracts/credit-card-transaction-repository';
import { CreditCardRepository } from '../../domain/contracts/credit-card-repository';
import { UpdateCreditCardTransactionDto, CreditCardTransactionResponseDto } from '../dtos/credit-card-transaction-dtos';

export class UpdateCreditCardTransactionUseCase {
  constructor(
    private readonly creditCardTransactionRepository: CreditCardTransactionRepository,
    private readonly creditCardRepository: CreditCardRepository
  ) {}

  async execute(userId: string, transactionId: string, dto: UpdateCreditCardTransactionDto): Promise<CreditCardTransactionResponseDto> {
    // Buscar a transação existente
    const existingTransaction = await this.creditCardTransactionRepository.findByUserIdAndId(userId, transactionId);
    if (!existingTransaction) {
      throw new Error('Transação de cartão de crédito não encontrada');
    }

    // Se o cartão de crédito for alterado, validar se existe e pertence ao usuário
    if (dto.creditCardId && dto.creditCardId !== existingTransaction.getCreditCardId()) {
      const creditCard = await this.creditCardRepository.findByUserIdAndId(userId, dto.creditCardId);
      if (!creditCard) {
        throw new Error('Cartão de crédito não encontrado');
      }
      if (!creditCard.isAtivo()) {
        throw new Error('Cartão de crédito está inativo');
      }
    }

    // Validações de negócio
    if (dto.valor !== undefined && dto.valor <= 0) {
      throw new Error('Valor da transação deve ser maior que zero');
    }

    if (dto.parcelas !== undefined && dto.parcelas < 1) {
      throw new Error('Número de parcelas deve ser maior que zero');
    }

    if (dto.parcelaAtual !== undefined && dto.parcelaAtual < 1) {
      throw new Error('Parcela atual deve ser maior que zero');
    }

    const parcelas = dto.parcelas ?? existingTransaction.getParcelas();
    const parcelaAtual = dto.parcelaAtual ?? existingTransaction.getParcelaAtual();

    if (parcelaAtual > parcelas) {
      throw new Error('Parcela atual não pode ser maior que o número total de parcelas');
    }

    // Criar nova instância com os dados atualizados
    const updatedTransaction = new CreditCardTransaction(
      existingTransaction.getId(),
      dto.descricao ?? existingTransaction.getDescricao(),
      dto.valor ?? existingTransaction.getValor(),
      dto.categoria !== undefined ? dto.categoria : existingTransaction.getCategoria(),
      dto.subcategoria !== undefined ? dto.subcategoria : existingTransaction.getSubcategoria(),
      dto.dataCompra ?? existingTransaction.getDataCompra(),
      parcelas,
      parcelaAtual,
      dto.estabelecimento !== undefined ? dto.estabelecimento : existingTransaction.getEstabelecimento(),
      dto.observacoes !== undefined ? dto.observacoes : existingTransaction.getObservacoes(),
      dto.creditCardId ?? existingTransaction.getCreditCardId(),
      dto.invoiceId !== undefined ? dto.invoiceId : existingTransaction.getInvoiceId(),
      existingTransaction.getUserId(),
      existingTransaction.getCreatedAt(),
      new Date()
    );

    const savedTransaction = await this.creditCardTransactionRepository.update(transactionId, updatedTransaction);

    return this.toResponseDto(savedTransaction);
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