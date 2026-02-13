import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comment.schema';
import { Post, PostDocument } from '../posts/post.schema';
import { User, UserDocument } from '../users/user.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
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

  async create(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.commentModel.create({
      content: createCommentDto.content,
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

  async findCommentsForPost(
    postId: string,
    query: QueryCommentsDto,
  ): Promise<Paginator<CommentViewModel>> {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const totalCount = await this.commentModel.countDocuments({ postId });

    const comments = await this.commentModel
      .find({ postId })
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .populate('userId', 'login');

    const pagesCount = Math.ceil(totalCount / pageSize);

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

  async findOne(id: string) {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

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

  async update(id: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    // 👇 Используй findByIdAndUpdate
    const updatedComment = await this.commentModel.findByIdAndUpdate(
      id,
      { content: updateCommentDto.content },
      { new: true },
    );

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: updatedComment!._id.toString(),
      content: updatedComment!.content,
      commentatorInfo: {
        userId: userId,
        userLogin: user.login,
      },
      createdAt: updatedComment!.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }

  async remove(id: string, userId: string) {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentModel.findByIdAndDelete(id);
  }
}
