import { left, right } from 'src/shared/types/either';

import {
  ResetPasswordUseCaseRequest,
  ResetPasswordUseCaseResponse,
} from './reset-password.use-case.interface';
import { UserIdentityProviderServiceAdapter } from '../../domain/adapters/aws-cognito-adapter';
import { UserNotFoundException } from '../../domain/errors/user-not-found-exception';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class ResetPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private identityProvider: UserIdentityProviderServiceAdapter,
  ) {}

  async execute({
    email,
    code,
    newPassword,
  }: ResetPasswordUseCaseRequest): Promise<ResetPasswordUseCaseResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return left(new UserNotFoundException(email));
    }

    await this.identityProvider.confirmPasswordReset(email, code, newPassword);

    return right({
      message: 'Senha redefinida com sucesso',
    });
  }
}
