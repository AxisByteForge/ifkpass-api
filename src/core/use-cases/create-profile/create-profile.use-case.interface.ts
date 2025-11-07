import { Either } from 'src/shared/types/either';
import { KarateRank } from 'src/core/domain/entities/User.entity';

export interface CreateProfileUseCaseRequest {
  Id: string;
  body: {
    birthDate: string;
    city: string;
    cpf: string;
    dojo: string;
    rank: KarateRank;
    sensei: string;
    photoUrl: string;
  };
}

export type CreateProfileUseCaseResponse = Either<null, { message: string }>;
