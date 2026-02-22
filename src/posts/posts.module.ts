import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// ↓ ДОБАВЛЕНО: импорт CqrsModule
import { CqrsModule } from '@nestjs/cqrs';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from './post.schema';
import { Blog, BlogSchema } from '../blogs/blog.schema';
import { CommentsModule } from '../comments/comments.module';
// ↓ ДОБАВЛЕНО: импорт всех UseCases
import { CreatePostUseCase } from './use-cases/create-post.use-case';
import { UpdatePostUseCase } from './use-cases/update-post.use-case';
import { DeletePostUseCase } from './use-cases/delete-post.use-case';

// ↓ ДОБАВЛЕНО: массив для удобного подключения в providers
const UseCases = [CreatePostUseCase, UpdatePostUseCase, DeletePostUseCase];

@Module({
  imports: [
    // ↓ ДОБАВЛЕНО: CqrsModule обязателен для работы CommandBus
    CqrsModule,
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
    ]),
    CommentsModule,
  ],
  controllers: [PostsController],
  // ↓ ИЗМЕНЕНО: добавили UseCases в providers
  providers: [PostsService, ...UseCases],
  exports: [PostsService],
})
export class PostsModule {}
