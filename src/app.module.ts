import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TestingController } from './testing/testing.controller';
import { TestingService } from './testing/testing.service';
import { TestingModule } from '@nestjs/testing';
import { BlogsModule } from './blogs/blogs.module';

@Module({
  imports: [PrismaModule.forRoot(), UsersModule, TestingModule, BlogsModule],
  controllers: [TestingController],
  providers: [TestingService],
})
export class AppModule {}
