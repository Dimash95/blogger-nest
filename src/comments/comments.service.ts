import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comment.schema';
import { Post, PostDocument } from '../posts/post.schema';
import { User, UserDocument } from '../users/user.schema';
// ↓ УДАЛЕНО: CreateCommentDto, UpdateCommentDto — больше не нужны в сервисе
import { QueryCommentsDto } from './dto/query-comments.dto';
import {
  Paginator,
  CommentViewModel,
} from './entities/comment-paginator.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // ↓ УДАЛЕНО: метод create — переехал в CreateCommentUseCase

  // ↓ НЕ ИЗМЕНИЛОСЬ: query остаётся в сервисе
  async findCommentsForPost(
    postId: string,
    query: QueryCommentsDto,
  ): Promise<Paginator<CommentViewModel>> {
    const post = await this.postModel.findById(postId);

    if (!post) throw new NotFoundException('Post not found');

    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const totalCount = await this.commentModel.countDocuments({ postId });
    const pagesCount = Math.ceil(totalCount / pageSize);

    const comments = await this.commentModel
      .find({ postId })
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: await Promise.all(
        comments.map(async (comment) => {
          const user = await this.userModel.findById(comment.userId);
          return {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
              userId: comment.userId.toString(),
              userLogin: user!.login,
            },
            createdAt: comment.createdAt,
            likesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
            },
          };
        }),
      ),
    };
  }

  // ↓ НЕ ИЗМЕНИЛОСЬ: query остаётся в сервисе
  async findOne(id: string) {
    const comment = await this.commentModel.findById(id);

    if (!comment) throw new NotFoundException('Comment not found');

    const user = await this.userModel.findById(comment.userId);

    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId.toString(),
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

  // ↓ УДАЛЕНО: методы update и remove — переехали в UseCases
}
