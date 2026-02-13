import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { BlogsModule } from './blogs/blogs.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { TestingModule } from './testing/testing.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { MongooseModule } from '@nestjs/mongoose';
// import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
// import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // делаем ConfigModule глобальным
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL!),
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 10000, // 10 секунд
    //     limit: 5, // 5 запросов
    //   },
    // ]),
    PrismaModule.forRoot(),
    UsersModule,
    TestingModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
    AuthModule,
    EmailModule,
  ],
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: ThrottlerGuard,
  //   },
  // ],
})
export class AppModule {}
