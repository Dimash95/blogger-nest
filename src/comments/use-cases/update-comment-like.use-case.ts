import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../comment.schema';
import { LikeStatus } from '../../likes/dto/like-status.dto';

export class UpdateCommentLikeCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly userLogin: string,
    public readonly likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateCommentLikeCommand)
export class UpdateCommentLikeUseCase implements ICommandHandler<UpdateCommentLikeCommand> {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async execute({
    commentId,
    userId,
    userLogin,
    likeStatus,
  }: UpdateCommentLikeCommand) {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) throw new NotFoundException('Comment not found');

    // ↓ Ищем существующий лайк этого юзера
    const existingLike = comment.likes.find((l) => l.userId === userId);

    if (existingLike) {
      if (likeStatus === 'None') {
        // ↓ Если None — удаляем лайк совсем
        comment.likes = comment.likes.filter((l) => l.userId !== userId);
      } else {
        // ↓ Обновляем статус существующего лайка
        existingLike.status = likeStatus;
        existingLike.addedAt = new Date();
      }
    } else if (likeStatus !== 'None') {
      // ↓ Добавляем новый лайк (None не сохраняем)
      comment.likes.push({
        userId,
        userLogin,
        status: likeStatus,
        addedAt: new Date(),
      });
    }

    await comment.save();
  }
}
