import { User } from '../../../users/domain/entities/user';
import { Email } from '@src/modules/shared/domain/value-objects/email';
import { Password } from '@src/modules/shared/domain/value-objects/password';
import { UserRepository } from '../../../users/domain/contracts/user-repository';
import { UserAlreadyExistsError } from '@src/modules/shared/domain/errors/user-errors';
import { RegisterUserDto, AuthResponseDto } from '../dtos/auth-dtos';
import { JwtProvider } from '@src/modules/shared/infrastructure/providers/jwt-provider';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtProvider: JwtProvider
  ) {}

  async execute(dto: RegisterUserDto): Promise<AuthResponseDto> {
    const email = new Email(dto.email);
    
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError(dto.email);
    }

    const password = await Password.create(dto.password);
    
    const user = new User({
      name: dto.name,
      email,
      password,
    });

    const savedUser = await this.userRepository.create(user);

    const tokenPayload = {
      sub: savedUser.getId()!,
      name: savedUser.getName(),
      email: savedUser.getEmail().getValue(),
    };

    const accessToken = this.jwtProvider.generateAccessToken(tokenPayload);
    const refreshToken = this.jwtProvider.generateRefreshToken(tokenPayload);

    return {
      user: {
        id: savedUser.getId()!,
        name: savedUser.getName(),
        email: savedUser.getEmail().getValue(),
      },
      accessToken,
      refreshToken,
    };
  }
}