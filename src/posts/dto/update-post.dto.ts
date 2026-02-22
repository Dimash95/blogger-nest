import { IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

// ↓ ИЗМЕНЕНО: убрали PartialType — для PUT все поля обязательны
export class UpdatePostDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @IsString()
  @IsNotEmpty()
  blogId: string;
}
