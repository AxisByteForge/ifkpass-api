import { left, right } from 'src/shared/types/either';

import {
  ApproveUserUseCaseRequest,
  ApproveUserUseCaseResponse,
} from './approve-user.use-case.interface';
import { UserStatus } from '../../domain/entities/User.entity';
import { UserNotFoundException } from '../../domain/errors/user-not-found-exception';
import { AdminRepository } from '../../domain/repositories/AdminRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';

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
