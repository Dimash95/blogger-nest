import { IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class ConfirmationCodeDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  code: string;
}
