import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../../posts/post.schema';
import { LikeStatus } from '../../likes/dto/like-status.dto';

export class UpdatePostLikeCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly userLogin: string,
    public readonly likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdatePostLikeCommand)
export class UpdatePostLikeUseCase implements ICommandHandler<UpdatePostLikeCommand> {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async execute({
    postId,
    userId,
    userLogin,
    likeStatus,
  }: UpdatePostLikeCommand) {
    const post = await this.postModel.findById(postId);

    if (!post) throw new NotFoundException('Post not found');

    // ↓ Ищем существующий лайк этого юзера
    const existingLike = post.likes.find((l) => l.userId === userId);

    if (existingLike) {
      if (likeStatus === 'None') {
        // ↓ Если None — удаляем лайк совсем
        post.likes = post.likes.filter((l) => l.userId !== userId);
      } else {
        // ↓ Обновляем статус существующего лайка
        existingLike.status = likeStatus;
        existingLike.addedAt = new Date();
      }
    } else if (likeStatus !== 'None') {
      // ↓ Добавляем новый лайк (None не сохраняем)
      post.likes.push({
        userId,
        userLogin,
        status: likeStatus,
        addedAt: new Date(),
      });
    }

    await post.save();
  }
}
