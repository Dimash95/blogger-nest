import { IsIn, IsString } from 'class-validator';

export type LikeStatus = 'None' | 'Like' | 'Dislike';

export class LikeStatusDto {
  @IsString()
  // ↓ тесты проверяют именно эти три значения
  @IsIn(['None', 'Like', 'Dislike'])
  likeStatus: LikeStatus;
}
