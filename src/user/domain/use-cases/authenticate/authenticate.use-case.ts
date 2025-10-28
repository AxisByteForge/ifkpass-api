import { left, right } from 'src/shared/types/either';

import {
  AuthenticateUseCaseRequest,
  AuthenticateUseCaseResponse,
} from './authenticate.use-case.interface';
import { UserIdentityProviderServiceAdapter } from '../../adapters/aws/aws-cognito-adapter';
import { UserStatus } from '../../entities/User.entity';
import { UserNotApprovedException } from '../../errors/user-not-approved-exception';
import { UserNotFoundException } from '../../errors/user-not-found-exception';
import { UserRepository } from '../../repositories/UserRepository';

export class AuthenticateUseCase {
  constructor(
    private userRepository: UserRepository,
    private identityProvider: UserIdentityProviderServiceAdapter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return left(new UserNotFoundException(email));
    }

    if (user.getStatus() === UserStatus.PENDING) {
      return left(new UserNotApprovedException());
    }

    if (user.getStatus() === UserStatus.REJECTED) {
      return left(
        new Error(
          'Sua conta foi rejeitada por um administrador. Entre em contato para mais informações.',
        ),
      );
    }

    const id = user.getId();

    const token = await this.identityProvider.signIn(id, password);

    return right({
      statusCode: 200,
      token,
    });
  }
}
