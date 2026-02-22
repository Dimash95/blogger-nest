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
  UseGuards,
  Req,
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
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard';
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from 'src/auth/guards/jwt-auth.guard';
import { LikeStatusDto } from 'src/likes/dto/like-status.dto';
import { UpdatePostLikeCommand } from 'src/likes/use-cases/update-post-like.use-case';

@Controller('posts')
export class PostsController {
  constructor(
    // ↓ ДОБАВЛЕНО: CommandBus вместо прямого вызова сервиса для мутаций
    private readonly commandBus: CommandBus,
    // ↓ ОСТАЛОСЬ: сервис используем только для query (findAll, findOne)
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  create(@Body() dto: CreatePostDto) {
    // ↓ ИЗМЕНЕНО: было postsService.create(dto)
    return this.commandBus.execute(new CreatePostCommand(dto));
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findAll(
    @Query() query: QueryPostsDto,
    // ↓ ДОБАВЛЕНО: берём userId из токена если есть (опционально)
    @Req() req: Request & { user?: { userId: string } },
  ) {
    const userId = req.user?.userId;
    return this.postsService.findAll(query, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    // ↓ ДОБАВЛЕНО: берём userId из токена если есть (опционально)
    @Req() req: Request & { user?: { userId: string } },
  ) {
    const userId = req.user?.userId;
    return this.postsService.findOne(id, userId);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    // ↓ ИЗМЕНЕНО: было postsService.update(id, dto)
    return this.commandBus.execute(new UpdatePostCommand(id, dto));
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    // ↓ ИЗМЕНЕНО: было postsService.remove(id)
    return this.commandBus.execute(new DeletePostCommand(id));
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post(':postId/comments')
  createComment(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request & { user: { userId: string; userLogin: string } },
  ) {
    // ↓ НЕ ИЗМЕНИЛОСЬ: comments пока не трогаем
    const { userId } = req.user;
    return this.commandBus.execute(
      new CreateCommentCommand(postId, userId, createCommentDto),
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':postId/comments')
  findCommentsForPost(
    @Param('postId') postId: string,
    @Query() query: QueryCommentsDto,
  ) {
    // ↓ НЕ ИЗМЕНИЛОСЬ
    return this.commentsService.findCommentsForPost(postId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(204)
  updateLike(
    @Param('postId') postId: string,
    @Body() dto: LikeStatusDto,
    @Req() req: Request & { user: { userId: string; userLogin: string } },
  ) {
    const { userId, userLogin } = req.user;
    return this.commandBus.execute(
      new UpdatePostLikeCommand(postId, userId, userLogin, dto.likeStatus),
    );
  }
}
