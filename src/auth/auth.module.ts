import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CustomJwtService } from './jwt.service';
import { EmailModule } from '../email/email.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({}), // Пустая конфигурация, т.к. мы используем CustomJwtService
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, CustomJwtService, JwtAuthGuard],
  exports: [CustomJwtService, JwtAuthGuard],
})
export class AuthModule {}
