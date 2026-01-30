import { randomUUID } from 'node:crypto';

import {
  findUserByEmail,
  createUserInDb
} from '@/infra/database/repository/user-db.service';

import type { CreateUserInput } from './create-user.use-case.interface';
import { UserAlreadyExistsException } from '@/shared/errors/user-already-exists-exception';

const createUser = async (input: CreateUserInput): Promise<string> => {
  const userExists = await findUserByEmail(input.email);

  if (userExists) {
    throw UserAlreadyExistsException(input.email);
  }

  const userId = randomUUID();

  await createUserInDb({
    Id: userId,
    name: input.name,
    lastName: input.lastName,
    email: input.email,
    isAdmin: input.isAdmin ?? false,
    status: 'pending'
  });

  return userId;
};

export { createUser };
