import type {
  VerifyEmailInput,
  VerifyEmailOutput
} from './verify-email.use-case.interface';
import { findUserById } from '@/infra/database/repository/user-db.service';
import { confirmEmailCognito } from '@/infra/identity-provider/user-auth.service';

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
