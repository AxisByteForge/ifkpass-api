import { confirmPasswordResetCognito } from '@/infra/identity-provider/user-auth.service';

import {
  ResetPasswordInput,
  ResetPasswordOutput
} from './reset-password.use-case.interface';
import { findUserByEmail } from '@/infra/database/repository/user/user-db.service';

export const resetPassword = async (
  input: ResetPasswordInput
): Promise<ResetPasswordOutput> => {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new Error(`Usuário com email ${input.email} não encontrado`);
  }

  await confirmPasswordResetCognito(input.email, input.code, input.newPassword);

  return {
    message: 'Senha redefinida com sucesso'
  };
};
