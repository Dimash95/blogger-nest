import {
  Controller,
  Get,
  Delete,
  Param,
  Req,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(private authService: AuthService) {}

  @Get()
  async getDevices(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException();
    return this.authService.getDevices(refreshToken);
  }

  @Delete()
  @HttpCode(204)
  async deleteAllDevices(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException();
    await this.authService.deleteAllDevices(refreshToken);
  }

  @Delete(':deviceId')
  @HttpCode(204)
  async deleteDevice(@Req() req: Request, @Param('deviceId') deviceId: string) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException();
    await this.authService.deleteDevice(refreshToken, deviceId);
  }
}
