import {
  findUserById,
  updateUser
} from '@/infra/database/repository/user/user-db.service';
import { UserNotFoundError } from '@/shared/errors/user-not-found-exception';
import {
  CreateProfileInput,
  CreateProfileOutput
} from './create-profile.service.interface';

export const createProfile = async (
  input: CreateProfileInput
): Promise<CreateProfileOutput> => {
  const user = await findUserById(input.Id);

  if (!user) {
    throw new UserNotFoundError(input.Id);
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
