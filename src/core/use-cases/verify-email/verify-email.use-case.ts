import { left, right } from '@/shared/types/either';

import {
  VerifyEmailUseCaseRequest,
  VerifyEmailUseCaseResponse
} from './verify-email.use-case.interface';
import { UserIdentityProviderServiceAdapter } from '@/core/domain/adapters/aws-cognito-adapter';
import { UserNotFoundException } from '@/core/domain/errors/user-not-found-exception';
import { UserRepository } from '@/core/domain/repositories/UserRepository';

export class VerifyEmailUseCase {
  constructor(
    private userRepository: UserRepository,
    private identityProvider: UserIdentityProviderServiceAdapter
  ) {}

  async execute({
    code,
    email
  }: VerifyEmailUseCaseRequest): Promise<VerifyEmailUseCaseResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return left(new UserNotFoundException(email));
    }

    const id = user.getId();

    await this.identityProvider.confirmEmail(id, code);

    return right({
      message: 'Email verified successfully'
    });
  }
}
