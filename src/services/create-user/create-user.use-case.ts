import { randomUUID } from 'node:crypto';

import {
  findUserByEmail,
  createUserInDb
} from '@/infra/database/user-db.service';
import {
  signUpUser,
  confirmAndPromoteAdmin
} from '@/infra/database/user-auth.service';
import type { CreateUserInput } from './create-user.use-case.interface';

const createUser = async (input: CreateUserInput): Promise<string> => {
  const userExists = await findUserByEmail(input.email);
  if (userExists) {
    throw new Error(`Usuário com email ${input.email} já existe`);
  }

  const userId = randomUUID();

  await signUpUser(userId, input.email, input.password);

  if (input.isAdmin) {
    await confirmAndPromoteAdmin(userId);
  }

  const now = new Date().toISOString();
  await createUserInDb({
    Id: userId,
    name: input.name,
    lastName: input.lastName,
    email: input.email,
    isAdmin: input.isAdmin ?? false,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  });

  return userId;
};

export { createUser };
