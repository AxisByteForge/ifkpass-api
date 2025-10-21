import { left, right } from 'src/shared/types/either';

import {
  CreateUserUseCaseRequest,
  CreateUserUseCaseResponse,
} from './create-user.use-case.interface';
import { UserIdentityProviderServiceAdapter } from '../../adapters/aws/aws-cognito-adapter';
import { User } from '../../entities/User.entity';
import { UserAlreadyExistsException } from '../../errors/user-already-exists-exception';
import { UserRepository } from '../../repositories/UserRepository';

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private identityProvider: UserIdentityProviderServiceAdapter,
  ) {}

  async execute({
    props,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const user = User.create({
      name: props.name,
      lastName: props.lastName,
      email: props.email,
    });

    const email = user.getEmail();
    const userId = user.getId();

    const userAlreadyExists = await this.userRepository.findByEmail(email);

    if (userAlreadyExists) {
      return left(new UserAlreadyExistsException(email));
    }
    await Promise.all([
      this.identityProvider.signUp(userId, email, props.password),
      this.userRepository.create(user),
    ]);

    return right({
      message: 'Created',
    });
  }
}
