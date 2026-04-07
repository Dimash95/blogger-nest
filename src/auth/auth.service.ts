import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import bcrypt from 'bcryptjs';
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
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
    private jwtService: CustomJwtService,
  ) {}

  async registration(dto: RegistrationDto): Promise<void> {
    const { login, password, email } = dto;

    const userByLogin = await this.userModel.findOne({ login });
    const userByEmail = await this.userModel.findOne({ email });

    if (userByLogin) {
      throw new BadRequestException({
        errorsMessages: [
          { message: 'User with this login already exists', field: 'login' },
        ],
      });
    }

    if (userByEmail) {
      throw new BadRequestException({
        errorsMessages: [
          { message: 'User with this email already exists', field: 'email' },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmationCode = randomUUID();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    await this.userModel.create({
      login,
      password: hashedPassword,
      email,
      emailConfirmation: {
        confirmationCode,
        expirationDate,
        isConfirmed: false,
      },
    });

    this.emailService.sendRegistrationEmail(email, confirmationCode);
  }

  async registrationConfirmation(dto: ConfirmationCodeDto): Promise<void> {
    const { code } = dto;

    const user = await this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });

    if (!user) {
      throw new BadRequestException({
        errorsMessages: [
          { message: 'Confirmation code is incorrect', field: 'code' },
        ],
      });
    }

    if (user.emailConfirmation.expirationDate < new Date()) {
      throw new BadRequestException({
        errorsMessages: [
          { message: 'Confirmation code expired', field: 'code' },
        ],
      });
    }

    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'Email already confirmed', field: 'code' }],
      });
    }

    user.emailConfirmation.isConfirmed = true;
    await user.save();
  }

  async registrationEmailResending(dto: EmailDto): Promise<void> {
    const { email } = dto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException({
        errorsMessages: [
          { message: 'User with this email not found', field: 'email' },
        ],
      });
    }

    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException({
        errorsMessages: [
          { message: 'Email already confirmed', field: 'email' },
        ],
      });
    }

    const newConfirmationCode = randomUUID();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    user.emailConfirmation.confirmationCode = newConfirmationCode;
    user.emailConfirmation.expirationDate = expirationDate;
    await user.save();

    this.emailService.sendRegistrationEmail(email, newConfirmationCode);
  }

  async login(dto: LoginDto, ip: string, userAgent: string) {
    const { loginOrEmail, password } = dto;

    const user = await this.userModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });

    if (!user) {
      throw new UnauthorizedException({
        errorsMessages: [
          { message: 'Invalid credentials', field: 'loginOrEmail' },
        ],
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        errorsMessages: [{ message: 'Invalid credentials', field: 'password' }],
      });
    }

    if (!user.emailConfirmation?.isConfirmed) {
      throw new UnauthorizedException({
        errorsMessages: [{ message: 'Email not confirmed', field: 'email' }],
      });
    }

    const deviceId = randomUUID();
    const accessToken = this.jwtService.generateAccessToken(
      user._id.toString(),
      user.login,
    );
    const {
      token: refreshToken,
      tokenId,
      expiresAt,
    } = this.jwtService.generateRefreshToken(
      user._id.toString(),
      user.login,
      deviceId,
    );

    user.devices.push({
      ip,
      title: userAgent,
      lastActiveDate: new Date(),
      deviceId,
    });

    user.refreshTokens.push({
      token: refreshToken,
      tokenId,
      deviceId,
      isValid: true,
      createdAt: new Date(),
      expiresAt,
    });

    await user.save();

    return { accessToken };
  }

  async passwordRecovery(dto: EmailDto): Promise<void> {
    const { email } = dto;
    const user = await this.userModel.findOne({ email });

    if (!user) return;

    const recoveryCode = randomUUID();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    user.emailConfirmation.recoveryCode = recoveryCode;
    user.emailConfirmation.expirationDate = expirationDate;
    await user.save();

    this.emailService.sendPasswordRecovery(email, recoveryCode);
  }

  async newPassword(dto: NewPasswordDto): Promise<void> {
    const { newPassword, recoveryCode } = dto;

    const user = await this.userModel.findOne({
      'emailConfirmation.recoveryCode': recoveryCode,
    });

    if (!user) {
      throw new BadRequestException({
        errorsMessages: [
          { message: 'Confirmation code is incorrect', field: 'recoveryCode' },
        ],
      });
    }

    if (user.emailConfirmation.expirationDate < new Date()) {
      throw new BadRequestException({
        errorsMessages: [
          { message: 'Confirmation code expired', field: 'recoveryCode' },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.emailConfirmation.isConfirmed = true;
    await user.save();
  }

  async refreshToken(oldRefreshToken: string) {
    const payload = this.jwtService.verifyRefreshToken(oldRefreshToken);
    if (!payload) throw new UnauthorizedException();

    const user = await this.userModel.findById(payload.userId);
    if (!user) throw new UnauthorizedException();

    const tokenRecord = user.refreshTokens.find(
      (t: any) => t.tokenId === payload.tokenId && t.isValid,
    );
    if (!tokenRecord) throw new UnauthorizedException();

    // invalidate old token
    tokenRecord.isValid = false;

    const { token: newRefreshToken, tokenId, expiresAt } = this.jwtService.generateRefreshToken(
      user._id.toString(),
      user.login,
      payload.deviceId,
    );

    const newAccessToken = this.jwtService.generateAccessToken(
      user._id.toString(),
      user.login,
    );

    // update device lastActiveDate
    const device = user.devices.find((d: any) => d.deviceId === payload.deviceId);
    if (device) device.lastActiveDate = new Date();

    user.refreshTokens.push({
      token: newRefreshToken,
      tokenId,
      deviceId: payload.deviceId,
      isValid: true,
      createdAt: new Date(),
      expiresAt,
    });

    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(oldRefreshToken: string) {
    const payload = this.jwtService.verifyRefreshToken(oldRefreshToken);
    if (!payload) throw new UnauthorizedException();

    const user = await this.userModel.findById(payload.userId);
    if (!user) throw new UnauthorizedException();

    const tokenRecord = user.refreshTokens.find(
      (t: any) => t.tokenId === payload.tokenId && t.isValid,
    );
    if (!tokenRecord) throw new UnauthorizedException();

    tokenRecord.isValid = false;

    // remove device
    user.devices = user.devices.filter((d: any) => d.deviceId !== payload.deviceId);

    await user.save();
  }

  async getDevices(refreshToken: string) {
    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    if (!payload) throw new UnauthorizedException();

    const user = await this.userModel.findById(payload.userId);
    if (!user) throw new UnauthorizedException();

    const tokenRecord = user.refreshTokens.find(
      (t: any) => t.tokenId === payload.tokenId && t.isValid,
    );
    if (!tokenRecord) throw new UnauthorizedException();

    return user.devices.map((d: any) => ({
      ip: d.ip,
      title: d.title,
      lastActiveDate: d.lastActiveDate,
      deviceId: d.deviceId,
    }));
  }

  async deleteAllDevices(refreshToken: string) {
    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    if (!payload) throw new UnauthorizedException();

    const user = await this.userModel.findById(payload.userId);
    if (!user) throw new UnauthorizedException();

    const tokenRecord = user.refreshTokens.find(
      (t: any) => t.tokenId === payload.tokenId && t.isValid,
    );
    if (!tokenRecord) throw new UnauthorizedException();

    // keep only current device
    user.devices = user.devices.filter((d: any) => d.deviceId === payload.deviceId);
    // invalidate all other refresh tokens
    user.refreshTokens = user.refreshTokens.map((t: any) => {
      if (t.deviceId !== payload.deviceId) t.isValid = false;
      return t;
    });

    await user.save();
  }

  async deleteDevice(refreshToken: string, deviceId: string) {
    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    if (!payload) throw new UnauthorizedException();

    const user = await this.userModel.findById(payload.userId);
    if (!user) throw new UnauthorizedException();

    const tokenRecord = user.refreshTokens.find(
      (t: any) => t.tokenId === payload.tokenId && t.isValid,
    );
    if (!tokenRecord) throw new UnauthorizedException();

    const device = user.devices.find((d: any) => d.deviceId === deviceId);
    if (!device) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException();
    }

    if (device.deviceId !== payload.deviceId) {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException();
    }

    user.devices = user.devices.filter((d: any) => d.deviceId !== deviceId);
    user.refreshTokens = user.refreshTokens.map((t: any) => {
      if (t.deviceId === deviceId) t.isValid = false;
      return t;
    });

    await user.save();
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException({
        errorsMessages: [{ message: 'User not found', field: 'userId' }],
      });
    }

    return {
      userId: user._id.toString(),
      login: user.login,
      email: user.email,
    };
  }
}
