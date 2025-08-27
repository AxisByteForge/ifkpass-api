import { Either } from '../../../domain/either';

export interface SendPhotoUseCaseRequest {
  userId: string;
}

export type SendPhotoUseCaseResponse = Either<
  null,
  {
    uploadUrl: string;
    photoUrl: string;
  }
>;
