import { getConfig } from '@/shared/lib/config/env/get-env';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  [key: string]: any;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const getPrivateKey = (): string => {
  const privateKeyBase64 = getConfig('JWT_PRIVATE_KEY');
  if (!privateKeyBase64) {
    throw new Error('JWT_PRIVATE_KEY is not defined in environment variables');
  }
  return Buffer.from(privateKeyBase64, 'base64').toString('utf-8');
};

const getPublicKey = (): string => {
  const publicKeyBase64 = getConfig('JWT_PUBLIC_KEY');
  if (!publicKeyBase64) {
    throw new Error('JWT_PUBLIC_KEY is not defined in environment variables');
  }
  return Buffer.from(publicKeyBase64, 'base64').toString('utf-8');
};

const generateAccessToken = (payload: JwtPayload): string => {
  const privateKey = getPrivateKey();
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '15m'
  });
};

const generateRefreshToken = (payload: JwtPayload): string => {
  const privateKey = getPrivateKey();
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '7d'
  });
};

const generateTokenPair = (payload: JwtPayload): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

const verifyToken = (token: string): JwtPayload => {
  try {
    const publicKey = getPublicKey();
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    });
    return decoded as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

const decodeToken = (token: string): JwtPayload | null => {
  const decoded = jwt.decode(token);
  return decoded as JwtPayload | null;
};

export {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  decodeToken
};
