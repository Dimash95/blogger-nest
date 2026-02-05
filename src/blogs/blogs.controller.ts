import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  Query,
  Put,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { CreatePostForBlogDto } from 'src/posts/dto/create-post-for-blog.dto';
import { QueryPostsDto } from 'src/posts/dto/query-posts.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.create(createBlogDto);
  }

  @Get()
  findAll(@Query() query: QueryBlogsDto) {
    return this.blogsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @Put(':id')
  @HttpCode(204)
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    await this.blogsService.update(id, updateBlogDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }

  @Post(':blogId/posts')
  createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() createPostDto: CreatePostForBlogDto,
  ) {
    return this.blogsService.createPostForBlog(blogId, createPostDto);
  }

  @Get(':blogId/posts')
  findPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: QueryPostsDto,
  ) {
    return this.blogsService.findPostsForBlog(blogId, query);
  }
}
