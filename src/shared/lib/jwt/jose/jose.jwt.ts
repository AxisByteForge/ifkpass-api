import { jwtVerify, createRemoteJWKSet } from 'jose';

import { UnauthorizedError } from 'src/shared/types/errors/http-errors';

import { Config } from '../../config/env/get-env';

const config = new Config();

const baseUrl = config.get('COGNITO_URL');
const userPoolId = config.get('COGNITO_USER_POOL_ID');
const clientId = config.get('COGNITO_CLIENT_ID');
const adminGroup = config.get('COGNITO_ADMINS_GROUP_NAME');

const JWKS = createRemoteJWKSet(
  new URL(`${baseUrl}/${userPoolId}/.well-known/jwks.json`),
);

interface DecodedTokenResult {
  Id: string;
  sub: string;
  email: string;
  isAdmin: boolean;
}

export async function verifyToken(
  authHeader?: string,
): Promise<DecodedTokenResult> {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid token');
    }

    const token = authHeader.replace('Bearer ', '');

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${baseUrl}/${userPoolId}`,
      audience: clientId,
    });

    const sub = payload.sub as string;
    const email = payload.email as string;
    const Id = payload['cognito:username'] as string;
    const groupsClaim = payload['cognito:groups'];
    const groups = Array.isArray(groupsClaim)
      ? groupsClaim
      : groupsClaim
        ? [groupsClaim as string]
        : [];
    const isAdmin = groups.includes(adminGroup);

    return {
      Id,
      sub,
      email,
      isAdmin,
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes('exp')) {
      throw new UnauthorizedError(
        'Token expirado. Faça login novamente para continuar.',
      );
    }

    throw new UnauthorizedError(
      err instanceof Error ? err.message : 'Token inválido ou expirado',
    );
  }
}
