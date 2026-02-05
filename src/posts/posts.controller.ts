import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { QueryCommentsDto } from 'src/comments/dto/query-comments.dto';

@Controller('posts')
export class PostsController {
  commentsService: any;
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll(@Query() query: QueryPostsDto) {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @HttpCode(204)
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  @Post(':postId/comments')
  createComment(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    // TODO: Добавить получение userId из JWT токена
  ) {
    const userId = 'temp-user-id'; // Временная заглушка
    return this.commentsService.create(postId, userId, createCommentDto);
  }

  @Get(':postId/comments')
  findCommentsForPost(
    @Param('postId') postId: string,
    @Query() query: QueryCommentsDto,
  ) {
    return this.commentsService.findCommentsForPost(postId, query);
  }
}
