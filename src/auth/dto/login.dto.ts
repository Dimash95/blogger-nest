import { IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  loginOrEmail: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  password: string;
}
