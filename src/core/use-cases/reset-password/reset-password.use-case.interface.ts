import { Either } from 'src/shared/types/either';

export interface ResetPasswordUseCaseRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordUseCaseResponseDTO {
  message: string;
}

export type ResetPasswordUseCaseResponse = Either<
  Error,
  ResetPasswordUseCaseResponseDTO
>;
