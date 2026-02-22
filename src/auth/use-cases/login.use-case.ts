import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../users/user.schema';
import { CustomJwtService } from '../jwt.service';
import { LoginDto } from '../dto/login.dto';

export class LoginCommand {
  constructor(
    public readonly dto: LoginDto,
    public readonly ip: string,
    public readonly userAgent: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: CustomJwtService,
  ) {}

  async execute({ dto, ip, userAgent }: LoginCommand) {
    const { loginOrEmail, password } = dto;

    const user = await this.userModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });

    if (!user) throw new UnauthorizedException();

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException();

    if (!user.emailConfirmation?.isConfirmed) throw new UnauthorizedException();

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

    // Логика сохранения устройства и токена — переехала из AuthService.login()
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

    // ↓ Возвращаем оба токена — контроллер сам положит refreshToken в cookie
    return { accessToken, refreshToken };
  }
}
