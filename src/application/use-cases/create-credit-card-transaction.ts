import { CreditCardTransaction } from '../../domain/entities/credit-card-transaction';
import { CreditCardTransactionRepository } from '../../domain/contracts/credit-card-transaction-repository';
import { CreditCardRepository } from '../../domain/contracts/credit-card-repository';
import { CreateCreditCardTransactionDto, CreditCardTransactionResponseDto } from '../dtos/credit-card-transaction-dtos';

export class CreateCreditCardTransactionUseCase {
  constructor(
    private readonly creditCardTransactionRepository: CreditCardTransactionRepository,
    private readonly creditCardRepository: CreditCardRepository
  ) {}

  async execute(dto: CreateCreditCardTransactionDto): Promise<CreditCardTransactionResponseDto> {
    // Validar se o cartão de crédito existe e pertence ao usuário
    const creditCard = await this.creditCardRepository.findByUserIdAndId(dto.userId, dto.creditCardId);
    if (!creditCard) {
      throw new Error('Cartão de crédito não encontrado');
    }

    if (!creditCard.isAtivo()) {
      throw new Error('Cartão de crédito está inativo');
    }

    // Validações de negócio
    if (dto.valor <= 0) {
      throw new Error('Valor da transação deve ser maior que zero');
    }

    if (dto.parcelas && dto.parcelas < 1) {
      throw new Error('Número de parcelas deve ser maior que zero');
    }

    if (dto.parcelaAtual && dto.parcelaAtual < 1) {
      throw new Error('Parcela atual deve ser maior que zero');
    }

    if (dto.parcelas && dto.parcelaAtual && dto.parcelaAtual > dto.parcelas) {
      throw new Error('Parcela atual não pode ser maior que o número total de parcelas');
    }

    // Criar a transação
    const transaction = CreditCardTransaction.create({
      descricao: dto.descricao,
      valor: dto.valor,
      categoria: dto.categoria,
      subcategoria: dto.subcategoria,
      dataCompra: dto.dataCompra,
      parcelas: dto.parcelas || 1,
      parcelaAtual: dto.parcelaAtual || 1,
      estabelecimento: dto.estabelecimento,
      observacoes: dto.observacoes,
      creditCardId: dto.creditCardId,
      invoiceId: dto.invoiceId,
      userId: dto.userId,
    });

    const savedTransaction = await this.creditCardTransactionRepository.create(transaction);

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