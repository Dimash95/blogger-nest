import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(20)
  @MaxLength(300)
  content: string;
}
