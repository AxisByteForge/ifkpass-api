import type {
  VerifyEmailInput,
  VerifyEmailOutput
} from './verify-email.interface';
import { findUserById } from '@/infra/database/user-db.service';
import { confirmEmailCognito } from '@/infra/database/user-auth.service';

export const verifyEmail = async (
  input: VerifyEmailInput
): Promise<VerifyEmailOutput> => {
  const user = await findUserById(input.Id);

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  await confirmEmailCognito(input.Id, input.code);

  return {
    message: 'Email verified successfully'
  };
};
