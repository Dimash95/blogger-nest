import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import {
  Paginator,
  CommentViewModel,
} from './entities/comment-paginator.entity';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        userId,
        postId,
      },
      include: {
        user: true,
      },
    });

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.user.login,
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
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const where = { postId };

    const totalCount = await this.prisma.comment.count({ where });

    const comments = await this.prisma.comment.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: {
        [sortBy]: sortDirection,
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.user.login,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      })),
    };
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.user.login,
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
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      include: {
        user: true,
      },
    });

    return {
      id: updatedComment.id,
      content: updatedComment.content,
      commentatorInfo: {
        userId: updatedComment.userId,
        userLogin: updatedComment.user.login,
      },
      createdAt: updatedComment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }

  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
