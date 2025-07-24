import { FinancialAccount } from '../../domain/entities/financial-account';
import { FinancialAccountRepository } from '../../domain/contracts/financial-account-repository';
import { CreateFinancialAccountDto, FinancialAccountResponseDto } from '../dtos/financial-account-dtos';

export class CreateFinancialAccountUseCase {
  constructor(
    private readonly financialAccountRepository: FinancialAccountRepository
  ) {}

  async execute(dto: CreateFinancialAccountDto): Promise<FinancialAccountResponseDto> {
    const account = new FinancialAccount({
      nome: dto.nome,
      tipo: dto.tipo,
      instituicao: dto.instituicao,
      saldoInicial: dto.saldoInicial,
      saldoAtual: dto.saldoInicial, // Saldo atual inicia igual ao saldo inicial
      cor: dto.cor,
      icone: dto.icone,
      ativa: true,
      observacoes: dto.observacoes,
      userId: dto.userId,
    });

    const savedAccount = await this.financialAccountRepository.create(account);

    return this.toResponseDto(savedAccount);
  }

  private toResponseDto(account: FinancialAccount): FinancialAccountResponseDto {
    const id = account.getId();
    if (!id) {
      throw new Error('Financial account must have an ID');
    }
    
    return {
      id,
      nome: account.getNome(),
      tipo: account.getTipo(),
      instituicao: account.getInstituicao() || null,
      saldo_inicial: account.getSaldoInicial(),
      saldo_atual: account.getSaldoAtual(),
      cor: account.getCor() || null,
      icone: account.getIcone() || null,
      ativa: account.isAtiva(),
      observacoes: account.getObservacoes() || null,
      user: account.getUserId(),
      date_created: account.getCreatedAt().toISOString(),
      date_updated: account.getUpdatedAt().toISOString(),
    };
  }
}