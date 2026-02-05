import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestingService {
  constructor(private prisma: PrismaService) {}

  async deleteAllData() {
    // Удаляем все данные из всех таблиц
    await this.prisma.user.deleteMany({});

    // Добавляй сюда другие модели по мере их создания
    // await this.prisma.post.deleteMany({});
    // await this.prisma.comment.deleteMany({});

    return { message: 'All data has been deleted' };
  }
}
