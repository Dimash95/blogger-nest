import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { BlogsModule } from './blogs/blogs.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { TestingModule } from './testing/testing.module';

@Module({
  imports: [
    PrismaModule.forRoot(),
    UsersModule,
    TestingModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
  ],
})
export class AppModule {}
