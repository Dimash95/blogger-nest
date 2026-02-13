import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingController } from './testing.controller';
import { TestingService } from './testing.service';
import { Comment, CommentSchema } from '../comments/comment.schema';
import { Post, PostSchema } from '../posts/post.schema';
import { User, UserSchema } from '../users/user.schema';
import { Blog, BlogSchema } from '../blogs/blog.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
    ]),
  ],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
