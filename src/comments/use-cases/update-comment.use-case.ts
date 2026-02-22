import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../comment.schema';
import { UpdateCommentDto } from '../dto/update-comment.dto';

export class UpdateCommentCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly dto: UpdateCommentDto,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async execute({ id, userId, dto }: UpdateCommentCommand) {
    const comment = await this.commentModel.findById(id);

    if (!comment) throw new NotFoundException('Comment not found');

    // Проверка что юзер редактирует свой комментарий — переехала из CommentsService.update()
    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    await this.commentModel.findByIdAndUpdate(id, { content: dto.content });
    // update возвращает void (204)
  }
}
