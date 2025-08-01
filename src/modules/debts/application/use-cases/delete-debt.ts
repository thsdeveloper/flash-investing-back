import {DebtRepository} from "@src/modules/debts/domain/contracts/debt-repository";

export class DeleteDebtUseCase {
  constructor(
    private readonly debtRepository: DebtRepository
  ) {}

  async execute(id: string, userId: string): Promise<boolean> {
    const debt = await this.debtRepository.findById(id, userId);

    if (!debt) {
      return false;
    }

    await this.debtRepository.delete(id, userId);
    return true;
  }
}