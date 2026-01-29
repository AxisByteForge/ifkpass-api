import { Either } from '@/shared/types/either';
import { UserStatus } from '@/core/domain/entities/User.entity';

export interface ApproveUserUseCaseRequest {
  adminId: string;
  Id: string;
  status: UserStatus.APPROVED | UserStatus.REJECTED;
}

export interface ApproveUserUseCaseResponseDTO {
  message: string;
}

export type ApproveUserUseCaseResponse = Either<
  Error,
  ApproveUserUseCaseResponseDTO
>;
