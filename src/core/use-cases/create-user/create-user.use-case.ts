import { randomUUID } from 'node:crypto';
import type { CreateUserInput } from './create-user.interface';
import {
  findUserByEmail,
  createUserInDb
} from '@/infra/database/services/user-db.service';
import {
  signUpUser,
  confirmAndPromoteAdmin
} from '@/infra/database/services/user-auth.service';

const createUser = async (input: CreateUserInput): Promise<string> => {
  const { name, lastName, email, password, isAdmin = false } = input;

  // Verificar se usuário já existe
  const userExists = await findUserByEmail(email);
  if (userExists) {
    throw new Error(`Usuário com email ${email} já existe`);
  }

  const userId = randomUUID();

  // Criar no Cognito
  await signUpUser(userId, email, password);

  // Se admin, confirmar e adicionar ao grupo
  if (isAdmin) {
    await confirmAndPromoteAdmin(userId);
  }

  // Salvar no DynamoDB
  const now = new Date().toISOString();
  await createUserInDb({
    Id: userId,
    name,
    lastName,
    email,
    isAdmin,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  });

  return userId;
};

export default createUser;
