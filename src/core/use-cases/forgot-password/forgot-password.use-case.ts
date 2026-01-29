import { left, right } from '@/shared/types/either';

import {
  ForgotPasswordUseCaseRequest,
  ForgotPasswordUseCaseResponse
} from './forgot-password.use-case.interface';
import { UserIdentityProviderServiceAdapter } from '../../domain/adapters/aws-cognito-adapter';
import { UserNotFoundException } from '../../domain/errors/user-not-found-exception';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class ForgotPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private identityProvider: UserIdentityProviderServiceAdapter
  ) {}

  async execute({
    email
  }: ForgotPasswordUseCaseRequest): Promise<ForgotPasswordUseCaseResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return left(new UserNotFoundException(email));
    }

    await this.identityProvider.forgotPassword(email);

    return right({
      message: 'Código de redefinição de senha enviado para o e-mail'
    });
  }
}
