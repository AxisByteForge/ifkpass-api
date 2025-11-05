import { Either } from 'src/shared/types/either';

import { AdminAlreadyExistsException } from '../../domain/errors/admin-already-exists-exception';

export interface CreateAdminUseCaseRequest {
  props: {
    name: string;
    lastName: string;
    email: string;
    password: string;
  };
}

export type CreateAdminUseCaseResponse = Either<
  AdminAlreadyExistsException,
  { message: string }
>;
