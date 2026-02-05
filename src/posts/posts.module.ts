import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { CommentsService } from 'src/comments/comments.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, CommentsService],
})
export class PostsModule {}
