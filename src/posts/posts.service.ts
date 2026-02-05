import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { Paginator, PostViewModel } from './entities/post-paginator.entity';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  private formatPostWithLikes(post: any): PostViewModel {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blog.name,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }

  async create(createPostDto: CreatePostDto) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: createPostDto.blogId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const post = await this.prisma.post.create({
      data: createPostDto,
      include: {
        blog: true,
      },
    });

    return this.formatPostWithLikes(post);
  }

  async findAll(query: QueryPostsDto): Promise<Paginator<PostViewModel>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const totalCount = await this.prisma.post.count();

    const posts = await this.prisma.post.findMany({
      include: {
        blog: true,
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
      items: posts.map((post) => this.formatPostWithLikes(post)),
    };
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        blog: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.formatPostWithLikes(post);
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (updatePostDto.blogId) {
      const blog = await this.prisma.blog.findUnique({
        where: { id: updatePostDto.blogId },
      });

      if (!blog) {
        throw new NotFoundException('Blog not found');
      }
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: {
        blog: true,
      },
    });

    return this.formatPostWithLikes(updatedPost);
  }

  async remove(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.prisma.post.delete({
      where: { id },
    });
  }
}
