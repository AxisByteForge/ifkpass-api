import { left, right } from 'src/shared/types/either';
import { UserStatus } from 'src/user/domain/entities/User.entity';
import { UserNotFoundException } from 'src/user/domain/errors/user-not-found-exception';
import { UserRepository } from 'src/user/domain/repositories/UserRepository';

import {
  ApproveUserUseCaseRequest,
  ApproveUserUseCaseResponse,
} from './approve-user.use-case.interface';
import { AdminRepository } from '../../repositories/AdminRepository';

export class ApproveUserUseCase {
  constructor(
    private adminRepository: AdminRepository,
    private userRepository: UserRepository,
  ) {}

  async execute({
    adminId,
    userId,
    status,
  }: ApproveUserUseCaseRequest): Promise<ApproveUserUseCaseResponse> {
    const admin = await this.adminRepository.findById(adminId);

    if (!admin) {
      return left(new Error('Admin not found'));
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new UserNotFoundException(userId));
    }

    await this.userRepository.updateStatus(userId, status);

    return right({
      message: `User ${status === UserStatus.APPROVED ? 'approved' : 'rejected'} successfully`,
    });
  }
}
