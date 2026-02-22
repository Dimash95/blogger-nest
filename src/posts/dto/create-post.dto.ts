import { IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePostDto {
  // ↓ ДОБАВЛЕНО: Transform + IsNotEmpty на все строковые поля
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
