import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

export interface TokenPayload {
  userId: string;
  userLogin: string;
}

export interface RefreshTokenPayload extends TokenPayload {
  tokenId: string;
  deviceId: string;
}

@Injectable()
export class CustomJwtService {
  constructor(private jwtService: NestJwtService) {}

  generateAccessToken(userId: string, userLogin: string): string {
    const payload: TokenPayload = { userId, userLogin };
    return this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET || 'access-secret',
      expiresIn: '10m', // 10 минут
    });
  }

  generateRefreshToken(
    userId: string,
    userLogin: string,
    deviceId: string,
  ): {
    token: string;
    tokenId: string;
    expiresAt: Date;
  } {
    const tokenId = randomUUID();
    const payload: RefreshTokenPayload = {
      userId,
      userLogin,
      tokenId,
      deviceId,
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
      expiresIn: '10m',
    });

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    return { token, tokenId, expiresAt };
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return this.jwtService.verify<TokenPayload>(token, {
        secret: process.env.ACCESS_TOKEN_SECRET || 'access-secret',
      });
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return this.jwtService.verify<RefreshTokenPayload>(token, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
      });
    } catch {
      return null;
    }
  }
}
