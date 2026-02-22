import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../comment.schema';

export class DeleteCommentCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async execute({ id, userId }: DeleteCommentCommand) {
    const comment = await this.commentModel.findById(id);

    if (!comment) throw new NotFoundException('Comment not found');

    // Проверка что юзер удаляет свой комментарий — переехала из CommentsService.remove()
    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentModel.findByIdAndDelete(id);
    // delete возвращает void (204)
  }
}
