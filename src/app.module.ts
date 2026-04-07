import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { BlogsModule } from './blogs/blogs.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { TestingModule } from './testing/testing.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DATABASE_URL!),
    UsersModule,
    TestingModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
    AuthModule,
    EmailModule,
  ],
})
export class AppModule {}
