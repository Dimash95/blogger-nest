import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService],
  exports: [BlogsService, ...UseCases],
})
export class BlogsModule {}
