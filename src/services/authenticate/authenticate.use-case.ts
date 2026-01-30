import { signInUser } from '@/infra/identity-provider/user-auth.service';
import { findUserByEmail } from '@/infra/database/repository/user-db.service';
import {
  AuthenticateInput,
  AuthenticateOutput
} from './authenticate.use-case.interface';

export const authenticate = async (
  input: AuthenticateInput
): Promise<AuthenticateOutput> => {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new Error(`Usuário com email ${input.email} não encontrado`);
  }

  if (user.status === 'pending') {
    throw new Error('Usuário ainda não foi aprovado');
  }

  if (user.status === 'rejected') {
    throw new Error(
      'Sua conta foi rejeitada por um administrador. Entre em contato para mais informações.'
    );
  }

  const token = await signInUser(user.Id, input.password);

  return {
    statusCode: 200,
    token
  };
};
