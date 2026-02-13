import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CustomJwtService } from './jwt.service';
import { EmailModule } from '../email/email.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User, UserSchema } from '../users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({}),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, CustomJwtService, JwtAuthGuard],
  exports: [CustomJwtService, JwtAuthGuard],
})
export class AuthModule {}
