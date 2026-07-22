import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes as per specification

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    {
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

export function verifyAccessToken(token: string): TokenPayload & { sub: string } {
  return jwt.verify(token, JWT_SECRET) as TokenPayload & { sub: string };
}
