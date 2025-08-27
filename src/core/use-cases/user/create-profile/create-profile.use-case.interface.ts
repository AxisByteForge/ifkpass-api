import { Either } from '../../../domain/either';

export interface CreateProfileUseCaseRequest {
  userId: string;
  body: {
    birthDate: string;
    city: string;
    cpf: string;
    dojo: string;
    rank: string;
    sensei: string;
    photoUrl: string;
  };
}

export type CreateProfileUseCaseResponse = Either<null, { message: string }>;
