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
// ↓ ДОБАВЛЕНО: импорт CommandBus
import { CommandBus } from '@nestjs/cqrs';
import { PostsService } from './posts.service';
// ↓ ДОБАВЛЕНО: импорт команд
import { CreatePostCommand } from './use-cases/create-post.use-case';
import { UpdatePostCommand } from './use-cases/update-post.use-case';
import { DeletePostCommand } from './use-cases/delete-post.use-case';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { QueryCommentsDto } from '../comments/dto/query-comments.dto';
import { CreateCommentCommand } from '../comments/use-cases/create-comment.use-case';

@Controller('posts')
export class PostsController {
  constructor(
    // ↓ ДОБАВЛЕНО: CommandBus вместо прямого вызова сервиса для мутаций
    private readonly commandBus: CommandBus,
    // ↓ ОСТАЛОСЬ: сервис используем только для query (findAll, findOne)
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Post()
  create(@Body() dto: CreatePostDto) {
    // ↓ ИЗМЕНЕНО: было postsService.create(dto)
    return this.commandBus.execute(new CreatePostCommand(dto));
  }

  @Get()
  findAll(@Query() query: QueryPostsDto) {
    // ↓ НЕ ИЗМЕНИЛОСЬ: query остаётся в сервисе
    return this.postsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // ↓ НЕ ИЗМЕНИЛОСЬ: query остаётся в сервисе
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @HttpCode(204)
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    // ↓ ИЗМЕНЕНО: было postsService.update(id, dto)
    return this.commandBus.execute(new UpdatePostCommand(id, dto));
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    // ↓ ИЗМЕНЕНО: было postsService.remove(id)
    return this.commandBus.execute(new DeletePostCommand(id));
  }

  @Post(':postId/comments')
  createComment(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    // ↓ НЕ ИЗМЕНИЛОСЬ: comments пока не трогаем
    const userId = 'temp-user-id';
    return this.commandBus.execute(
      new CreateCommentCommand(postId, userId, createCommentDto),
    );
  }

  @Get(':postId/comments')
  findCommentsForPost(
    @Param('postId') postId: string,
    @Query() query: QueryCommentsDto,
  ) {
    // ↓ НЕ ИЗМЕНИЛОСЬ
    return this.commentsService.findCommentsForPost(postId, query);
  }
}
