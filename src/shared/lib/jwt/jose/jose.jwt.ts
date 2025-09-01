import { jwtVerify, createRemoteJWKSet } from 'jose';

import { UnauthorizedError } from 'src/shared/types/errors/http-errors';

import { Config } from '../../config/env/get-env';

const config = new Config();

const baseUrl = config.get('COGNITO_URL');
const userPoolId = config.get('COGNITO_USER_POOL_ID');
const clientId = config.get('COGNITO_CLIENT_ID');

const JWKS = createRemoteJWKSet(
  new URL(`${baseUrl}/${userPoolId}/.well-known/jwks.json`),
);

interface DecodedTokenResult {
  userId: string;
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
    const userId = payload['cognito:username'] as string;
    const groups = payload['cognito:groups'] as string[] | undefined;
    const isAdmin = groups?.includes('Admin') ?? false;

    return {
      userId,
      sub,
      email,
      isAdmin,
    };
  } catch (err) {
    throw new UnauthorizedError(
      err instanceof Error ? err.message : 'Token inválido ou expirado',
    );
  }
}
