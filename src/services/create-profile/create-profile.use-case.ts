import { findUserById, updateUser } from '@/infra/database/user-db.service';
import type {
  CreateProfileInput,
  CreateProfileOutput
} from './create-profile.use-case.interface.ts';

export const createProfile = async (
  input: CreateProfileInput
): Promise<CreateProfileOutput> => {
  const user = await findUserById(input.Id);

  if (!user) {
    throw new Error('Usuário não encontrado');
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
