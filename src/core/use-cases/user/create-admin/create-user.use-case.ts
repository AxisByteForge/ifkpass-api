import {
  CreateUserUseCaseRequest,
  CreateUserUseCaseResponse,
} from './create-user.use-case.interface';
import { IdentityProviderServiceAdapter } from '../../../domain/adapters/aws/aws-cognito-adapter';
import { left, right } from '../../../domain/either';
import { Email } from '../../../domain/entities/Email';
import { User } from '../../../domain/entities/User.entity';
import { UserAlreadyExistsException } from '../../../domain/errors/user-already-exists-exception';
import { UserRepository } from '../../../domain/repositories/UserRepository';

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private identityProvider: IdentityProviderServiceAdapter,
  ) {}

  async execute({
    props,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const email = new Email(props.email);

    const userAlreadyExists = await this.userRepository.findByEmail(
      email.getValue(),
    );

    if (userAlreadyExists) {
      return left(new UserAlreadyExistsException(email.getValue()));
    }

    await this.identityProvider.signUp(email.getValue(), props.password);
    const userId = await this.identityProvider.getUserId(email.getValue());

    const user = User.create({
      userId: userId ?? '',
      name: props.name,
      lastName: props.lastName,
      email,
      isAdmin: props.isAdmin,
    });

    await this.userRepository.create(user);

    return right({
      message: 'Created',
    });
  }
}
