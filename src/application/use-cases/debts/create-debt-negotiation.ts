import { DebtRepository } from '../../../domain/contracts/debt-repository';
import { DebtNegotiationRepository } from '../../../domain/contracts/debt-negotiation-repository';
import { DebtNegotiation } from '../../../domain/entities/debt-negotiation';
import { CreateDebtNegotiationDto, DebtNegotiationResponseDto } from '../../dtos/debt-dtos';

export class CreateDebtNegotiationUseCase {
  constructor(
    private readonly debtRepository: DebtRepository,
    private readonly debtNegotiationRepository: DebtNegotiationRepository
  ) {}

  async execute(dto: CreateDebtNegotiationDto): Promise<DebtNegotiationResponseDto | null> {
    // Validate if debt exists and belongs to user
    const debt = await this.debtRepository.findById(dto.debtId, dto.userId);

    if (!debt) {
      return null;
    }

    // Create negotiation
    const negotiation = DebtNegotiation.create({
      debtId: dto.debtId,
      dataNegociacao: dto.data_negociacao,
      proposta: dto.proposta,
      status: dto.status,
      observacoes: dto.observacoes,
      userId: dto.userId,
    });

    // Save negotiation
    const savedNegotiation = await this.debtNegotiationRepository.create(negotiation);

    return {
      id: savedNegotiation.id,
      divida_id: savedNegotiation.debtId,
      data_negociacao: savedNegotiation.dataNegociacao.toISOString().split('T')[0],
      proposta: savedNegotiation.proposta,
      status: savedNegotiation.status,
      observacoes: savedNegotiation.observacoes ?? null,
      created_at: savedNegotiation.createdAt.toISOString(),
      updated_at: savedNegotiation.updatedAt.toISOString(),
    };
  }
}