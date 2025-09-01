import { right } from 'src/shared/types/either';

import {
  CreateProfileUseCaseRequest,
  CreateProfileUseCaseResponse,
} from './create-profile.use-case.interface';
import { Profile } from '../../entities/Profile.entity';
import { UserRepository } from '../../repositories/UserRepository';

export class CreateProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
    body,
  }: CreateProfileUseCaseRequest): Promise<CreateProfileUseCaseResponse> {
    const profile = Profile.create({
      ...body,
      userId,
    });

    await this.userRepository.createProfile(profile);

    return right({
      message: 'Created',
    });
  }
}
