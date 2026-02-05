import { eq, and, gt, sql, desc } from 'drizzle-orm';
import { db } from '@/shared/lib/db';

import { CreateAuthTokenParams } from './auth-tokens-db.interface';
import { AuthToken, authTokens } from '../../schemas';

// Helper to convert AuthToken to AuthTokensData

const countRecentTokens = async (userId: string): Promise<number> => {
  const result = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(authTokens)
    .where(
      and(
        eq(authTokens.userId, userId),
        eq(authTokens.type, 'login_code'),
        gt(authTokens.createdAt, sql`now() - interval '1 minute'`)
      )
    );

  return result[0]?.count ?? 0;
};

const getLastLoginTokenCreatedAt = async (
  userId: string
): Promise<Date | null> => {
  const result = await db
    .select({ createdAt: authTokens.createdAt })
    .from(authTokens)
    .where(
      and(eq(authTokens.userId, userId), eq(authTokens.type, 'login_code'))
    )
    .orderBy(desc(authTokens.createdAt))
    .limit(1);

  return result[0]?.createdAt ?? null;
};

const invalidateLoginCodes = async (
  userId: string,
  isAdmin: boolean
): Promise<void> => {
  await db
    .update(authTokens)
    .set({ used: true })
    .where(
      and(
        isAdmin
          ? eq(authTokens.adminId, userId)
          : eq(authTokens.userId, userId),
        eq(authTokens.type, 'login_code'),
        eq(authTokens.used, false)
      )
    );
};

const createAuthToken = async ({
  userId,
  adminId,
  token,
  type,
  expiresAt
}: CreateAuthTokenParams): Promise<AuthToken> => {
  const result = await db
    .insert(authTokens)
    .values({
      userId: userId ?? null,
      adminId: adminId ?? null,
      token,
      type,
      expiresAt,
      used: false
    })
    .returning();

  return result[0];
};

const findValidToken = async (
  tokenValue: string
): Promise<AuthToken | null> => {
  const result = await db
    .select()
    .from(authTokens)
    .where(
      and(
        eq(authTokens.token, tokenValue),
        eq(authTokens.used, false),
        gt(authTokens.expiresAt, sql`now()`)
      )
    )
    .limit(1);

  return result[0] ?? null;
};

const markTokenAsUsed = async (tokenValue: string): Promise<void> => {
  await db
    .update(authTokens)
    .set({ used: true })
    .where(eq(authTokens.token, tokenValue));
};

export {
  countRecentTokens,
  getLastLoginTokenCreatedAt,
  invalidateLoginCodes,
  createAuthToken,
  findValidToken,
  markTokenAsUsed
};
