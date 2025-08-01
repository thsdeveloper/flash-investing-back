import { Email } from '@src/modules/shared/domain/value-objects/email';
import { UserRepository } from '../../../users/domain/contracts/user-repository';
import { InvalidCredentialsError } from '@src/modules/shared/domain/errors/user-errors';
import { LoginDto, AuthResponseDto } from '../dtos/auth-dtos';
import { JwtProvider } from '@src/modules/shared/infrastructure/providers/jwt-provider';

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtProvider: JwtProvider
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    const email = new Email(dto.email);
    
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await user.verifyPassword(dto.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const tokenPayload = {
      sub: user.getId()!,
      name: user.getName(),
      email: user.getEmail().getValue(),
    };

    const accessToken = this.jwtProvider.generateAccessToken(tokenPayload);
    const refreshToken = this.jwtProvider.generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.getId()!,
        name: user.getName(),
        email: user.getEmail().getValue(),
      },
      accessToken,
      refreshToken,
    };
  }
}