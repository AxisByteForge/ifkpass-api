import { Either } from 'src/shared/types/either';
import { UserStatus } from 'src/core/domain/entities/User.entity';

export interface ApproveUserUseCaseRequest {
  adminId: string;
  userId: string;
  status: UserStatus.APPROVED | UserStatus.REJECTED;
}

export interface ApproveUserUseCaseResponseDTO {
  message: string;
}

export type ApproveUserUseCaseResponse = Either<
  Error,
  ApproveUserUseCaseResponseDTO
>;
