import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// ↓ ДОБАВЛЕНО: CqrsModule
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { Blog, BlogSchema } from './blog.schema';
import { Post, PostSchema } from '../posts/post.schema';
import { CreateBlogUseCase } from './use-cases/create-blog.use-case';
import { UpdateBlogUseCase } from './use-cases/update-blog.use-case';
import { DeleteBlogUseCase } from './use-cases/delete-blog.use-case';
import { CreatePostForBlogUseCase } from './use-cases/create-post-for-blog.use-case';

const UseCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostForBlogUseCase,
];

@Module({
  imports: [
    // ↓ ДОБАВЛЕНО: без этого CommandBus не работает
    CqrsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [BlogsController],
  // ↓ ИЗМЕНЕНО: UseCases добавлены в providers
  providers: [BlogsService, ...UseCases],
  // ↓ ИЗМЕНЕНО: UseCases убраны из exports — они нужны только внутри модуля
  exports: [BlogsService],
})
export class BlogsModule {}
