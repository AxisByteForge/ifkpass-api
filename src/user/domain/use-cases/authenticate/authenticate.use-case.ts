import { left, right } from 'src/shared/types/either';

import {
  AuthenticateUseCaseRequest,
  AuthenticateUseCaseResponse,
} from './authenticate.use-case.interface';
import { UserIdentityProviderServiceAdapter } from '../../adapters/aws/aws-cognito-adapter';
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

    const id = user.getId();

    const token = await this.identityProvider.signIn(id, password);

    return right({
      statusCode: 200,
      token,
    });
  }
}
