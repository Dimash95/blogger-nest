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
import { CommandBus } from '@nestjs/cqrs';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { CreatePostForBlogDto } from 'src/posts/dto/create-post-for-blog.dto';
import { QueryPostsDto } from 'src/posts/dto/query-posts.dto';
import { CreateBlogCommand } from './use-cases/create-blog.use-case';
import { UpdateBlogCommand } from './use-cases/update-blog.use-case';
import { DeleteBlogCommand } from './use-cases/delete-blog.use-case';
import { CreatePostForBlogCommand } from './use-cases/create-post-for-blog.use-case';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogsService: BlogsService,
  ) {}

  @Post()
  create(@Body() dto: CreateBlogDto) {
    return this.commandBus.execute(new CreateBlogCommand(dto));
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
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.commandBus.execute(new UpdateBlogCommand(id, dto));
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @Post(':blogId/posts')
  createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() dto: CreatePostForBlogDto,
  ) {
    return this.commandBus.execute(new CreatePostForBlogCommand(blogId, dto));
  }

  @Get(':blogId/posts')
  findPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: QueryPostsDto,
  ) {
    return this.blogsService.findPostsForBlog(blogId, query);
  }
}
