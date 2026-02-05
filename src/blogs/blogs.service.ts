import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { BlogViewModel, Paginator } from './entities/blog-paginator.entity';

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
    return await this.prisma.blog.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    return await this.prisma.blog.update({
      where: { id },
      data: updateBlogDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.blog.delete({
      where: { id },
    });
  }
}
