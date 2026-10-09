import * as jose from 'jose';
import { UserRole } from '@empathylink/types';

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || 'development_super_secret_access_key_min_32_bytes_long_safe_dev_only!'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'development_super_secret_refresh_key_min_32_bytes_long_safe_dev_only!'
);

export interface TokenPayload {
  userId: string;
  role: UserRole;
  email: string;
  sessionId?: string;
}

export async function signAccessToken(payload: TokenPayload, expiresIn = '15m'): Promise<string> {
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: TokenPayload, expiresIn = '30d'): Promise<string> {
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jose.jwtVerify(token, ACCESS_SECRET);
  return {
    userId: payload.userId as string,
    role: payload.role as UserRole,
    email: payload.email as string,
    sessionId: payload.sessionId as string | undefined,
  };
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  const { payload } = await jose.jwtVerify(token, REFRESH_SECRET);
  return {
    userId: payload.userId as string,
    role: payload.role as UserRole,
    email: payload.email as string,
    sessionId: payload.sessionId as string | undefined,
  };
}
