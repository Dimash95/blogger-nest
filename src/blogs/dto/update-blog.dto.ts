import { IsString, MaxLength, Matches, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

// ↓ ИЗМЕНЕНО: убрали PartialType — для PUT все поля обязательны
export class UpdateBlogDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  name: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
    { message: 'websiteUrl must be a valid HTTPS URL' },
  )
  websiteUrl: string;
}
