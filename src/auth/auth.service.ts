import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { EmailService } from '../email/email.service';
import { CustomJwtService } from './jwt.service';
import { RegistrationDto } from './dto/registration.dto';
import { LoginDto } from './dto/login.dto';
import { ConfirmationCodeDto } from './dto/confirmation-code.dto';
import { EmailDto } from './dto/email.dto';
import { NewPasswordDto } from './dto/new-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private jwtService: CustomJwtService,
  ) {}

  async registration(dto: RegistrationDto): Promise<any> {
    const { login, password, email } = dto;

    // Проверяем существование пользователя
    const userByLogin = await this.prisma.user.findUnique({
      where: { login },
    });

    if (userByLogin) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'User with this login already exists',
            field: 'login',
          },
        ],
      });
    }

    const userByEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userByEmail) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'User with this email already exists',
            field: 'email',
          },
        ],
      });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmationCode = randomUUID();

    // Создаем дату истечения (через 1 час)
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    // Создаем пользователя
    await this.prisma.user.create({
      data: {
        login,
        password: hashedPassword,
        email,
        emailConfirmation: {
          confirmationCode,
          expirationDate,
          isConfirmed: false,
        },
      },
    });

    console.log('✅ Created user with code:', confirmationCode);

    // Отправляем email
    try {
      await this.emailService.sendRegistrationEmail(email, confirmationCode);
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }

  async registrationConfirmation(dto: ConfirmationCodeDto): Promise<void> {
    const { code } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        emailConfirmation: {
          is: {
            confirmationCode: code,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Confirmation code is incorrect',
            field: 'code',
          },
        ],
      });
    }

    // Проверяем срок действия
    if (
      user.emailConfirmation &&
      user.emailConfirmation.expirationDate < new Date()
    ) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Confirmation code expired',
            field: 'code',
          },
        ],
      });
    }

    // Проверяем, не подтвержден ли уже
    if (user.emailConfirmation?.isConfirmed) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Email already confirmed',
            field: 'code',
          },
        ],
      });
    }

    // Подтверждаем email
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmation: {
          set: {
            confirmationCode: user.emailConfirmation!.confirmationCode,
            expirationDate: user.emailConfirmation!.expirationDate,
            isConfirmed: true,
            recoveryCode: user.emailConfirmation!.recoveryCode,
          },
        },
      },
    });
  }

  async registrationEmailResending(dto: EmailDto): Promise<void> {
    const { email } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'User with this email not found',
            field: 'email',
          },
        ],
      });
    }

    // Проверяем, не подтвержден ли уже
    if (user.emailConfirmation?.isConfirmed) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Email already confirmed',
            field: 'email',
          },
        ],
      });
    }

    // Генерируем новый код
    const newConfirmationCode = randomUUID();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmation: {
          set: {
            confirmationCode: newConfirmationCode,
            expirationDate,
            isConfirmed: user.emailConfirmation?.isConfirmed || false,
            recoveryCode: user.emailConfirmation?.recoveryCode || null,
          },
        },
      },
    });

    await this.emailService.sendRegistrationEmail(email, newConfirmationCode);
  }

  async login(
    dto: LoginDto,
    ip: string,
    userAgent: string,
  ): Promise<{ accessToken: string }> {
    const { loginOrEmail, password } = dto;

    // Ищем пользователя по login или email
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ login: loginOrEmail }, { email: loginOrEmail }],
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        errorsMessages: [
          {
            message: 'Invalid credentials',
            field: 'loginOrEmail',
          },
        ],
      });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        errorsMessages: [
          {
            message: 'Invalid credentials',
            field: 'password',
          },
        ],
      });
    }

    // Проверяем подтверждение email
    if (!user.emailConfirmation?.isConfirmed) {
      throw new UnauthorizedException({
        errorsMessages: [
          {
            message: 'Email not confirmed',
            field: 'email',
          },
        ],
      });
    }

    // Создаем устройство
    const deviceId = randomUUID();
    const newDevice = {
      ip,
      title: userAgent,
      lastActiveDate: new Date(),
      deviceId,
    };

    // Генерируем токены
    const accessToken = this.jwtService.generateAccessToken(
      user.id,
      user.login,
    );

    const {
      token: refreshToken,
      tokenId,
      expiresAt,
    } = this.jwtService.generateRefreshToken(user.id, user.login, deviceId);

    // Обновляем пользователя
    // Обновляем пользователя
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        devices: [...(user.devices || []), newDevice],
        refreshTokens: [
          ...(user.refreshTokens || []),
          {
            token: refreshToken, // <- это полный токен
            tokenId: tokenId, // <- это ID токена
            deviceId,
            isValid: true,
            createdAt: new Date(),
            expiresAt,
          },
        ],
      },
    });

    return { accessToken };
  }

  async passwordRecovery(dto: EmailDto): Promise<void> {
    const { email } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Не раскрываем информацию о существовании email
    if (!user) {
      return;
    }

    const recoveryCode = randomUUID();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmation: {
          set: {
            confirmationCode: user.emailConfirmation!.confirmationCode,
            expirationDate,
            isConfirmed: user.emailConfirmation!.isConfirmed,
            recoveryCode,
          },
        },
      },
    });

    try {
      await this.emailService.sendPasswordRecovery(email, recoveryCode);
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }

  async newPassword(dto: NewPasswordDto): Promise<void> {
    const { newPassword, recoveryCode } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        emailConfirmation: {
          is: {
            recoveryCode: recoveryCode,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Confirmation code is incorrect',
            field: 'recoveryCode',
          },
        ],
      });
    }

    // Проверяем срок действия
    if (
      user.emailConfirmation &&
      user.emailConfirmation.expirationDate < new Date()
    ) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Confirmation code expired',
            field: 'recoveryCode',
          },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailConfirmation: {
          set: {
            confirmationCode: user.emailConfirmation!.confirmationCode,
            expirationDate: user.emailConfirmation!.expirationDate,
            isConfirmed: true,
            recoveryCode: user.emailConfirmation!.recoveryCode,
          },
        },
      },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException({
        errorsMessages: [
          {
            message: 'User not found',
            field: 'userId',
          },
        ],
      });
    }

    return {
      userId: user.id,
      login: user.login,
      email: user.email,
    };
  }
}
