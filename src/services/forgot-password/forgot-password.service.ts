import { forgotPasswordCognito } from '@/infra/identity-provider/user-auth.service';

import {
  ForgotPasswordInput,
  ForgotPasswordOutput
} from './forgot-password.service.interface';
import { findUserByEmail } from '@/infra/database/repository/user/user-db.service';

export const forgotPassword = async (
  input: ForgotPasswordInput
): Promise<ForgotPasswordOutput> => {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new Error(`Usuário com email ${input.email} não encontrado`);
  }

  await forgotPasswordCognito(input.email);

  return {
    message: 'Código de redefinição de senha enviado para o e-mail'
  };
};
