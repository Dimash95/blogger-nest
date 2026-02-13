import { IsString, IsEmail, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegistrationDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/, {
    message: 'login must contain only letters, numbers, _ or -',
  })
  login: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(6, 20)
  password: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsEmail()
  email: string;
}
