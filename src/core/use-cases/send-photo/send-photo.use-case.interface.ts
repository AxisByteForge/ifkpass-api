import { Either } from 'src/shared/types/either';

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
