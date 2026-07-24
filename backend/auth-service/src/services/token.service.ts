import crypto from 'crypto';
import { prisma } from '../config/database';
import { generateAccessToken, TokenPayload } from '../utils/jwt';
import { UnauthorizedException } from 'shared-common';
import { redis } from '../config/redis';

export class TokenService {
  async generateTokens(payload: TokenPayload) {
    const accessToken = generateAccessToken(payload);
    const refreshToken = this.generateRandomToken();

    const hashedToken = this.hashToken(refreshToken);
    // Store in Redis (valid for 7 days = 604800 seconds)
    await redis.set(`refresh:token:${hashedToken}`, payload.userId, {
      EX: 7 * 24 * 60 * 60,
    });

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    const hashedToken = this.hashToken(refreshToken);

    const userId = await redis.get(`refresh:token:${hashedToken}`);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role.name,
    });
    const newRefreshToken = this.generateRandomToken();
    const newHashedToken = this.hashToken(newRefreshToken);

    // Delete old refresh token
    await redis.del(`refresh:token:${hashedToken}`);

    // Store new refresh token
    await redis.set(`refresh:token:${newHashedToken}`, user.id, {
      EX: 7 * 24 * 60 * 60,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        role: user.role.name,
        email: user.email,
      },
    };
  }

  async revokeRefreshToken(refreshToken: string) {
    const hashedToken = this.hashToken(refreshToken);
    await redis.del(`refresh:token:${hashedToken}`);
  }

  private generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
