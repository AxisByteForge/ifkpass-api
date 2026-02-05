import {
  findUserByEmail,
  createUserInDb
} from '@/infra/database/repository/user/user-db.service';
import { randomUUID } from 'node:crypto';
import { CreateUserInput } from './create-user.service.interface';
import { UserAlreadyExistsError } from '@/shared/errors/user-already-exists-exception';

const createUser = async (
  input: CreateUserInput
): Promise<string | UserAlreadyExistsError> => {
  const userExists = await findUserByEmail(input.email);

  if (userExists) {
    return new UserAlreadyExistsError(input.email);
  }

  const userId = randomUUID();

  await createUserInDb({
    id: userId,
    name: input.name,
    lastName: input.lastName,
    email: input.email,
    status: 'pending'
  });

  return userId;
};

export { createUser };
