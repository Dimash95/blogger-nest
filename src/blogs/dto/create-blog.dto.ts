import { IsString, MaxLength, Matches } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @MaxLength(15)
  name: string;

  @IsString()
  @MaxLength(500)
  description: string;

  @IsString()
  @MaxLength(100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
    {
      message: 'websiteUrl must be a valid HTTPS URL',
    },
  )
  websiteUrl: string;
}
