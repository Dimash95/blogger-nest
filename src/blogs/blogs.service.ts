import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { BlogViewModel, Paginator } from './entities/blog-paginator.entity';
import { QueryPostsDto } from 'src/posts/dto/query-posts.dto';
import { PostViewModel } from 'src/posts/entities/post-paginator.entity';
import { CreatePostForBlogDto } from 'src/posts/dto/create-post-for-blog.dto';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async create(createBlogDto: CreateBlogDto) {
    return await this.prisma.blog.create({
      data: createBlogDto,
    });
  }

  async findAll(query: QueryBlogsDto): Promise<Paginator<BlogViewModel>> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      query;

    // Построение фильтров поиска
    const where: any = {};

    if (searchNameTerm) {
      where.name = {
        contains: searchNameTerm,
        mode: 'insensitive',
      };
    }

    // Подсчет общего количества
    const totalCount = await this.prisma.blog.count({ where });

    // Получение блогов с пагинацией
    const blogs = await this.prisma.blog.findMany({
      where,
      orderBy: {
        [sortBy]: sortDirection,
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    // Подсчет количества страниц
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: blogs,
    };
  }

  async findOne(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return this.prisma.blog.update({
      where: { id },
      data: updateBlogDto,
    });
  }

  async remove(id: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return this.prisma.blog.delete({
      where: { id },
    });
  }

  async createPostForBlog(blogId: string, createPostDto: CreatePostForBlogDto) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const post = await this.prisma.post.create({
      data: {
        ...createPostDto,
        blogId,
      },
      include: {
        blog: true,
      },
    });

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blog.name,
      createdAt: post.createdAt,
    };
  }

  async findPostsForBlog(
    blogId: string,
    query: QueryPostsDto,
  ): Promise<Paginator<PostViewModel>> {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const where = { blogId };

    const totalCount = await this.prisma.post.count({ where });

    const posts = await this.prisma.post.findMany({
      where,
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
      items: posts.map((post) => ({
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blog.name,
        createdAt: post.createdAt,
      })),
    };
  }
}
