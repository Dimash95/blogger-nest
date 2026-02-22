import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
// ↓ ДОБАВЛЕНО: импорт CommandBus
import { CommandBus } from '@nestjs/cqrs';
import { CommentsService } from './comments.service';
// ↓ ДОБАВЛЕНО: импорт команд
import { UpdateCommentCommand } from './use-cases/update-comment.use-case';
import { DeleteCommentCommand } from './use-cases/delete-comment.use-case';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from 'src/auth/guards/jwt-auth.guard';
import { LikeStatusDto } from 'src/likes/dto/like-status.dto';
import { UpdateCommentLikeCommand } from './use-cases/update-comment-like.use-case';

@Controller('comments')
export class CommentsController {
  constructor(
    // ↓ ДОБАВЛЕНО: CommandBus для мутаций
    private readonly commandBus: CommandBus,
    // ↓ ОСТАЛОСЬ: сервис только для findOne
    private readonly commentsService: CommentsService,
  ) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: Request & { user?: { userId: string } },
  ) {
    const userId = req.user?.userId;
    return this.commentsService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(204)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: Request & { user: { userId: string } },
  ) {
    // ↓ ИЗМЕНЕНО: было commentsService.update(id, userId, dto)
    const { userId } = req.user;
    return this.commandBus.execute(new UpdateCommentCommand(id, userId, dto));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string } },
  ) {
    // ↓ ИЗМЕНЕНО: было commentsService.remove(id, userId)
    const { userId } = req.user;
    return this.commandBus.execute(new DeleteCommentCommand(id, userId));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(204)
  updateLike(
    @Param('commentId') commentId: string,
    @Body() dto: LikeStatusDto,
    @Req() req: Request & { user: { userId: string; userLogin: string } },
  ) {
    const { userId, userLogin } = req.user;
    return this.commandBus.execute(
      new UpdateCommentLikeCommand(
        commentId,
        userId,
        userLogin,
        dto.likeStatus,
      ),
    );
  }
}
