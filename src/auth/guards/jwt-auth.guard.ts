import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { CustomJwtService } from '../jwt.service';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private jwtService: CustomJwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // ↓ ОТЛИЧИЕ от OptionalJwtAuthGuard: нет токена — не бросаем ошибку, просто идём дальше
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return true;
    }

    const token = authHeader.split(' ')[1];
    const payload = this.jwtService.verifyAccessToken(token);

    // ↓ ОТЛИЧИЕ от OptionalJwtAuthGuard: невалидный токен — тоже не бросаем ошибку
    if (payload) {
      request.user = {
        userId: payload.userId,
        userLogin: payload.userLogin,
      };
    }

    return true;
  }
}
