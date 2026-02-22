import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
} from '@nestjs/common';
// ↓ ДОБАВЛЕНО: импорт CommandBus
import { CommandBus } from '@nestjs/cqrs';
import { CommentsService } from './comments.service';
// ↓ ДОБАВЛЕНО: импорт команд
import { UpdateCommentCommand } from './use-cases/update-comment.use-case';
import { DeleteCommentCommand } from './use-cases/delete-comment.use-case';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    // ↓ ДОБАВЛЕНО: CommandBus для мутаций
    private readonly commandBus: CommandBus,
    // ↓ ОСТАЛОСЬ: сервис только для findOne
    private readonly commentsService: CommentsService,
  ) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    // ↓ НЕ ИЗМЕНИЛОСЬ: query остаётся в сервисе
    return this.commentsService.findOne(id);
  }

  @Put(':id')
  @HttpCode(204)
  update(@Param('id') id: string, @Body() dto: UpdateCommentDto) {
    // ↓ ИЗМЕНЕНО: было commentsService.update(id, userId, dto)
    const userId = 'temp-user-id';
    return this.commandBus.execute(new UpdateCommentCommand(id, userId, dto));
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    // ↓ ИЗМЕНЕНО: было commentsService.remove(id, userId)
    const userId = 'temp-user-id';
    return this.commandBus.execute(new DeleteCommentCommand(id, userId));
  }
}
