import {
  findUserById,
  updateUser
} from '@/infra/database/repository/user/user-db.service';
import { UserNotFoundError } from '@/shared/errors/user-not-found-exception';
import {
  normalizeRank,
  beltCategoryFromRank,
  generateCardId
} from '@/shared/utils/karate-utils';
import {
  CreateProfileInput,
  CreateProfileOutput
} from './create-profile.service.interface';

export const createProfile = async (
  input: CreateProfileInput
): Promise<CreateProfileOutput> => {
  const user = await findUserById(input.id);

  if (!user) {
    throw new UserNotFoundError(input.id);
  }

  const normalizedRank = normalizeRank(input.body.rank);
  const cardId = generateCardId();
  const now = new Date().toISOString();

  // Prepare payment details update
  const currentPaymentDetails = user.paymentDetails || {
    alreadyPaid: false,
    status: 'pending',
    updatedAt: now
  };

  const updatedPaymentDetails = {
    ...currentPaymentDetails,
    rank: normalizedRank,
    beltCategory: beltCategoryFromRank(normalizedRank),
    updatedAt: now
  };

  await updateUser(input.id, {
    birthDate: input.body.birthDate,
    city: input.body.city,
    cpf: input.body.cpf,
    dojo: input.body.dojo,
    rank: normalizedRank,
    sensei: input.body.sensei,
    cardId,
    paymentDetails: updatedPaymentDetails
  });

  return {
    message: 'Created'
  };
};
