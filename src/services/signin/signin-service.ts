import { UserNotFoundError } from '@/shared/errors/user-not-found-exception';
import { TooManyTokensError } from '@/shared/errors/too-many-tokens-error';

import {
  countRecentTokens,
  createAuthToken,
  getLastLoginTokenCreatedAt,
  invalidateLoginCodes
} from '@/infra/database/repository/authTokens/auth-tokens-db.service';
import { findUserByEmail } from '@/infra/database/repository/user/user-db.service';
import { generateCode } from '@/shared/utils/generateCode';
import { getTokenExpiresAt } from '@/shared/utils/getTokenExpiresAt';
import { SigninInput, SigninOutput } from './signin.service.interface';
import { findAdminByEmail } from '@/infra/database/repository/admins/admins-db.service';

const isAdmin = async (email: string): Promise<any> => {
  const admin = await findAdminByEmail(email);

  if (!admin) {
    const user = await findUserByEmail(email);

    if (!user) {
      throw new UserNotFoundError(email);
    }

    return {
      id: user.id,
      email: user.email,
      isAdmin: false
    };
  }

  return {
    id: admin.id,
    email: admin.email,
    isAdmin: true
  };
};

export const signinUserService = async (
  input: SigninInput
): Promise<SigninOutput | TooManyTokensError> => {
  const user = await isAdmin(input.email);

  const recentTokenCount = await countRecentTokens(user.Id);

  if (recentTokenCount >= 2) {
    const lastTokenDate = await getLastLoginTokenCreatedAt(user);

    if (lastTokenDate) {
      const retryAfter = new Date(lastTokenDate.getTime() + 60 * 1000); // +1 minute
      return new TooManyTokensError(lastTokenDate, retryAfter);
    }
  }

  await invalidateLoginCodes(user.Id, user.isAdmin);

  const code = generateCode();

  await createAuthToken({
    userId: user.isAdmin ? null : user.Id,
    adminId: user.isAdmin ? user.Id : null,
    token: code,
    type: 'login_code',
    expiresAt: getTokenExpiresAt()
  });

  // await sendVerificationCode(user.email, code);

  return {
    message: 'Email verified successfully'
  };
};
