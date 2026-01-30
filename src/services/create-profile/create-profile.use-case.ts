import {
  findUserById,
  updateUser
} from '@/infra/database/repository/user-db.service';
import type {
  CreateProfileInput,
  CreateProfileOutput
} from './create-profile.use-case.interface.ts';
import { UserNotFoundException } from '@/shared/errors/user-not-found-exception.js';

export const createProfile = async (
  input: CreateProfileInput
): Promise<CreateProfileOutput> => {
  const user = await findUserById(input.Id);

  if (!user) {
    throw new UserNotFoundException(input.Id);
  }

  await updateUser(input.Id, {
    birthDate: input.body.birthDate,
    city: input.body.city,
    cpf: input.body.cpf,
    dojo: input.body.dojo,
    rank: input.body.rank,
    sensei: input.body.sensei
  });

  return {
    message: 'Created'
  };
};
