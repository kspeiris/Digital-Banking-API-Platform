import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const ACCESS_TOKEN_EXPIRY = '15m';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    {
      sub: payload.userId,
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    JWT_SECRET as jwt.Secret,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

export function verifyAccessToken(token: string): TokenPayload & { sub: string } {
  return jwt.verify(token, JWT_SECRET as jwt.Secret) as TokenPayload & { sub: string };
}
