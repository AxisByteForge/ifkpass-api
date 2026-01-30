import { forgotPasswordCognito } from '@/infra/database/user-auth.service';
import { findUserByEmail } from '@/infra/database/user-db.service';
import {
  ForgotPasswordInput,
  ForgotPasswordOutput
} from './forgot-password.use-case.interface';

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
