import { IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class NewPasswordDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(6, 20)
  newPassword: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  recoveryCode: string;
}
