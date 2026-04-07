import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { AuthService } from './auth.service';
import { LoginCommand } from './use-cases/login.use-case';
import { RegistrationDto } from './dto/registration.dto';
import { LoginDto } from './dto/login.dto';
import { ConfirmationCodeDto } from './dto/confirmation-code.dto';
import { EmailDto } from './dto/email.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { OptionalJwtAuthGuard, JwtAuthGuard } from './guards/jwt-auth.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    // ↓ ДОБАВЛЕНО: CommandBus
    private readonly commandBus: CommandBus,
    // ↓ ОСТАЛОСЬ: сервис для остальных методов
    private authService: AuthService,
  ) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 10000, limit: 5 } })
  async registration(@Body() dto: RegistrationDto) {
    return this.authService.registration(dto);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 10000, limit: 5 } })
  async registrationConfirmation(@Body() dto: ConfirmationCodeDto) {
    return this.authService.registrationConfirmation(dto);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 10000, limit: 5 } })
  async registrationEmailResending(@Body() dto: EmailDto) {
    return this.authService.registrationEmailResending(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 10000, limit: 5 } })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    // ↓ ДОБАВЛЕНО: Res для установки cookie (passthrough чтобы return продолжал работать)
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // ↓ ИЗМЕНЕНО: было authService.login(), теперь через CommandBus
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new LoginCommand(dto, ip, userAgent),
    );

    // ↓ ДОБАВЛЕНО: устанавливаем refreshToken в httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException();

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException();

    await this.authService.logout(refreshToken);
    res.clearCookie('refreshToken');
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() dto: EmailDto) {
    // ↓ НЕ ИЗМЕНИЛОСЬ
    return this.authService.passwordRecovery(dto);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() dto: NewPasswordDto) {
    // ↓ НЕ ИЗМЕНИЛОСЬ
    return this.authService.newPassword(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: Request & { user: { userId: string } }) {
    return this.authService.getMe(req.user.userId);
  }
}
