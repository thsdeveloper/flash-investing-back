import { DebtNegotiationRepository } from '../../../domain/contracts/debt-negotiation-repository';
import { UpdateDebtNegotiationDto, DebtNegotiationResponseDto } from '../../dtos/debt-dtos';

export class UpdateDebtNegotiationUseCase {
  constructor(
    private readonly debtNegotiationRepository: DebtNegotiationRepository
  ) {}

  async execute(dto: UpdateDebtNegotiationDto): Promise<DebtNegotiationResponseDto | null> {
    // Find existing negotiation
    const negotiation = await this.debtNegotiationRepository.findById(dto.id, dto.userId);

    if (!negotiation) {
      return null;
    }

    // Update negotiation status and observations
    negotiation.updateStatus(dto.status);
    
    if (dto.observacoes) {
      negotiation.updateObservacoes(dto.observacoes);
    }

    // Save updated negotiation
    const updatedNegotiation = await this.debtNegotiationRepository.update(negotiation);

    return {
      id: updatedNegotiation.id,
      divida_id: updatedNegotiation.debtId,
      data_negociacao: updatedNegotiation.dataNegociacao.toISOString().split('T')[0],
      proposta: updatedNegotiation.proposta,
      status: updatedNegotiation.status,
      observacoes: updatedNegotiation.observacoes ?? null,
      created_at: updatedNegotiation.createdAt.toISOString(),
      updated_at: updatedNegotiation.updatedAt.toISOString(),
    };
  }
}