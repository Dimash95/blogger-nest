import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Put(':id')
  @HttpCode(204)
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    // TODO: Добавить получение userId из JWT токена
    // Пока заглушка - нужна авторизация
  ) {
    const userId = 'temp-user-id'; // Временная заглушка
    return this.commentsService.update(id, userId, updateCommentDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    // TODO: Добавить получение userId из JWT токена
    const userId = 'temp-user-id'; // Временная заглушка
    return this.commentsService.remove(id, userId);
  }
}
