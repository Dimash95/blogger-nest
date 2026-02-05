import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestingService {
  constructor(private prisma: PrismaService) {}

  async deleteAllData() {
    await this.prisma.user.deleteMany({});
    await this.prisma.blog.deleteMany({});

    return { message: 'All data has been deleted' };
  }
}
