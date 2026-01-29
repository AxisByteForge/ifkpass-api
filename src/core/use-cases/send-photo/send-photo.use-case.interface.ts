import { Either } from '@/shared/types/either';

export interface SendPhotoUseCaseRequest {
  Id: string;
}

export type SendPhotoUseCaseResponse = Either<
  null,
  {
    uploadUrl: string;
    photoUrl: string;
  }
>;
