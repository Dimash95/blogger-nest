import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../comment.schema';
import { Post, PostDocument } from '../../posts/post.schema';
import { User, UserDocument } from '../../users/user.schema';
import { CreateCommentDto } from '../dto/create-comment.dto';

export class CreateCommentCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly dto: CreateCommentDto,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async execute({ postId, userId, dto }: CreateCommentCommand) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    // Логика создания переехала из CommentsService.create()
    const comment = await this.commentModel.create({
      content: dto.content,
      userId,
      postId,
    });

    const user = await this.userModel.findById(userId);

    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: userId,
        userLogin: user!.login,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }
}
