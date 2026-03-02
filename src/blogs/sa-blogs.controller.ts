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
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { CreatePostForBlogDto } from 'src/posts/dto/create-post-for-blog.dto';
import { CreateBlogCommand } from './use-cases/create-blog.use-case';
import { UpdateBlogCommand } from './use-cases/update-blog.use-case';
import { DeleteBlogCommand } from './use-cases/delete-blog.use-case';
import { CreatePostForBlogCommand } from './use-cases/create-post-for-blog.use-case';
import { UpdatePostDto } from 'src/posts/dto/update-post.dto';
import { UpdatePostCommand } from 'src/posts/use-cases/update-post.use-case';
import { DeletePostCommand } from 'src/posts/use-cases/delete-post.use-case';
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class SaBlogsController {
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
  createPost(
    @Param('blogId') blogId: string,
    @Body() dto: CreatePostForBlogDto,
  ) {
    return this.commandBus.execute(new CreatePostForBlogCommand(blogId, dto));
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  updatePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.commandBus.execute(new UpdatePostCommand(postId, dto));
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  deletePost(@Param('blogId') blogId: string, @Param('postId') postId: string) {
    return this.commandBus.execute(new DeletePostCommand(postId));
  }
}
