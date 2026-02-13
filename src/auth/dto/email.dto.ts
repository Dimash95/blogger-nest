import { IsString, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class EmailDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsEmail()
  email: string;
}
