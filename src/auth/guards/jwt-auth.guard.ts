import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomJwtService } from '../jwt.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: CustomJwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        errorsMessages: [
          {
            message: 'Access token not provided',
            field: 'authorization',
          },
        ],
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = this.jwtService.verifyAccessToken(token);

    if (!payload) {
      throw new UnauthorizedException({
        errorsMessages: [
          {
            message: 'Invalid or expired access token',
            field: 'authorization',
          },
        ],
      });
    }

    // Добавляем данные пользователя в request
    request.user = {
      userId: payload.userId,
      userLogin: payload.userLogin,
    };

    return true;
  }
}
