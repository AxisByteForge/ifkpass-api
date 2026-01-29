import { UserNotFoundException } from 'src/core/domain/errors/user-not-found-exception';
import { UserRepository } from 'src/core/domain/repositories/UserRepository';
import { right } from 'src/shared/types/either';

import {
  CreateProfileUseCaseRequest,
  CreateProfileUseCaseResponse,
} from './create-profile.use-case.interface';

export class CreateProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    Id,
    body,
  }: CreateProfileUseCaseRequest): Promise<CreateProfileUseCaseResponse> {
    const user = await this.userRepository.findById(Id);

    if (!user) {
      throw new UserNotFoundException('User not found');
    }

    user.createProfile(body);

    await this.userRepository.update(user);

    return right({
      message: 'Created',
    });
  }
}
