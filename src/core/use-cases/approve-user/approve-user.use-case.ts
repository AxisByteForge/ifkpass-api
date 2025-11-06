import { left, right } from 'src/shared/types/either';

import {
  ApproveUserUseCaseRequest,
  ApproveUserUseCaseResponse,
} from './approve-user.use-case.interface';
import { UserStatus } from '../../domain/entities/User.entity';
import { UserNotFoundException } from '../../domain/errors/user-not-found-exception';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class ApproveUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    adminId,
    Id,
    status,
  }: ApproveUserUseCaseRequest): Promise<ApproveUserUseCaseResponse> {
    const admin = await this.userRepository.findById(adminId);

    if (!admin || !admin.isAdmin()) {
      return left(new Error('Usuário não possui privilégios de administrador'));
    }

    const user = await this.userRepository.findById(Id);

    if (!user) {
      return left(new UserNotFoundException(Id));
    }

    await this.userRepository.updateStatus(Id, status);

    return right({
      message: `User ${status === UserStatus.APPROVED ? 'approved' : 'rejected'} successfully`,
    });
  }
}
