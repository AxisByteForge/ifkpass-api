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

export const signinUserService = async (
  input: SigninInput
): Promise<SigninOutput | TooManyTokensError> => {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new UserNotFoundError(input.email);
  }

  const recentTokenCount = await countRecentTokens(user.Id);

  if (recentTokenCount >= 2) {
    const lastTokenDate = await getLastLoginTokenCreatedAt(user.Id);

    if (lastTokenDate) {
      const retryAfter = new Date(lastTokenDate.getTime() + 60 * 1000); // +1 minute
      return new TooManyTokensError(lastTokenDate, retryAfter);
    }
  }

  await invalidateLoginCodes(user.Id);

  const code = generateCode();

  await createAuthToken({
    userId: user.Id,
    token: code,
    type: 'login_code',
    expiresAt: getTokenExpiresAt()
  });

  // await sendVerificationCode(user.email, code);

  return {
    message: 'Email verified successfully'
  };
};
