import crypto from 'crypto';
import { prisma } from '../config/database';
import { generateAccessToken, TokenPayload } from '../utils/jwt';
import { UnauthorizedException } from 'shared-common';

export class TokenService {
  async generateTokens(payload: TokenPayload) {
    const accessToken = generateAccessToken(payload);
    const refreshToken = this.generateRandomToken();

    // Store the hashed refresh token in database (valid for 7 days)
    const hashedToken = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        token: hashedToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    const hashedToken = this.hashToken(refreshToken);

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: { include: { role: true } } },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      if (tokenRecord) {
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate refresh token
    const newAccessToken = generateAccessToken({
      userId: tokenRecord.user.id,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role.name,
    });
    const newRefreshToken = this.generateRandomToken();
    const newHashedToken = this.hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

    await prisma.refreshToken.create({
      data: {
        userId: tokenRecord.userId,
        token: newHashedToken,
        expiresAt: newExpiresAt,
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async revokeRefreshToken(refreshToken: string) {
    const hashedToken = this.hashToken(refreshToken);
    try {
      await prisma.refreshToken.delete({
        where: { token: hashedToken },
      });
    } catch (err) {
      // Ignore if token doesn't exist
    }
  }

  private generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
