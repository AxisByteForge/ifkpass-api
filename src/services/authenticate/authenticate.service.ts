import { findUserByEmail } from '@/infra/database/repository/user/user-db.service';
import {
  AuthenticateInput,
  AuthenticateOutput
} from './authenticate.service.interface';
import { UserNotFoundError } from '@/shared/errors/user-not-found-exception';
import {
  findValidToken,
  markTokenAsUsed
} from '@/infra/database/repository/authTokens/auth-tokens-db.service';
import { TokenWasNotValidError } from '@/shared/errors/token-was-not-valid';
import { generateAccessToken } from '@/infra/jwt/jwt.service';
import { findAdminByEmail } from '@/infra/database/repository/admins/admins-db.service';

const isAdmin = async (email: string): Promise<any> => {
  const admin = await findAdminByEmail(email);

  if (!admin) {
    const user = await findUserByEmail(email);

    if (!user) {
      throw new UserNotFoundError(email);
    }

    return {
      Id: user.Id,
      email: user.email,
      isAdmin: false
    };
  }

  return {
    Id: admin.Id,
    email: admin.email,
    isAdmin: true
  };
};

export const authenticate = async (
  input: AuthenticateInput
): Promise<AuthenticateOutput | any> => {
  const user = await isAdmin(input.email);

  const code = input.code;

  const authToken = await findValidToken(code);

  if (!authToken) {
    return {
      statusCode: 401,
      message: 'Token was not valid'
    };
  }

  if (user.isAdmin) {
    await markTokenAsUsed(code);

    const token = generateAccessToken({
      userId: user.Id,
      email: user.email,
      isAdmin: true
    });

    return {
      statusCode: 200,
      token
    };
  }

  if (user.status === 'pending') {
    return {
      statusCode: 403,
      message: 'User not approved yet'
    };
  }

  if (user.status === 'rejected') {
    return {
      statusCode: 403,
      message: 'User application was rejected'
    };
  }

  await markTokenAsUsed(code);

  const token = generateAccessToken({ userId: user.Id, email: user.email });

  return {
    statusCode: 200,
    token
  };
};
