import { Either } from 'src/shared/types/either';

export interface ForgotPasswordUseCaseRequest {
  email: string;
}

export interface ForgotPasswordUseCaseResponseDTO {
  message: string;
}

export type ForgotPasswordUseCaseResponse = Either<
  Error,
  ForgotPasswordUseCaseResponseDTO
>;
