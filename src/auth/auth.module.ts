import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
// ↓ ДОБАВЛЕНО: CqrsModule
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CustomJwtService } from './jwt.service';
import { EmailModule } from '../email/email.module';
import { OptionalJwtAuthGuard } from './guards/jwt-auth.guard';
import { User, UserSchema } from '../users/user.schema';
// ↓ ДОБАВЛЕНО: импорт UseCase
import { LoginUseCase } from './use-cases/login.use-case';

@Module({
  imports: [
    // ↓ ДОБАВЛЕНО: CqrsModule
    CqrsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({}),
    EmailModule,
  ],
  controllers: [AuthController],
  // ↓ ИЗМЕНЕНО: добавили LoginUseCase в providers
  providers: [
    AuthService,
    CustomJwtService,
    OptionalJwtAuthGuard,
    LoginUseCase,
  ],
  exports: [CustomJwtService, OptionalJwtAuthGuard],
})
export class AuthModule {}
