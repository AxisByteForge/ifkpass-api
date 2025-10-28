import { left, right } from 'src/shared/types/either';

import {
  ForgotPasswordUseCaseRequest,
  ForgotPasswordUseCaseResponse,
} from './forgot-password.use-case.interface';
import { UserIdentityProviderServiceAdapter } from '../../adapters/aws/aws-cognito-adapter';
import { UserNotFoundException } from '../../errors/user-not-found-exception';
import { UserRepository } from '../../repositories/UserRepository';

export class ForgotPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private identityProvider: UserIdentityProviderServiceAdapter,
  ) {}

  async execute({
    email,
  }: ForgotPasswordUseCaseRequest): Promise<ForgotPasswordUseCaseResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return left(new UserNotFoundException(email));
    }

    await this.identityProvider.forgotPassword(email);

    return right({
      message: 'Código de redefinição de senha enviado para o e-mail',
    });
  }
}
