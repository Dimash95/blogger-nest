import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// ↓ ДОБАВЛЕНО: импорт CqrsModule
import { CqrsModule } from '@nestjs/cqrs';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment, CommentSchema } from './comment.schema';
import { Post, PostSchema } from '../posts/post.schema';
import { User, UserSchema } from '../users/user.schema';
// ↓ ДОБАВЛЕНО: импорт UseCases
import { CreateCommentUseCase } from './use-cases/create-comment.use-case';
import { UpdateCommentUseCase } from './use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './use-cases/delete-comment.use-case';
import { UpdateCommentLikeUseCase } from './use-cases/update-comment-like.use-case';
import { AuthModule } from 'src/auth/auth.module';

// ↓ ДОБАВЛЕНО: массив UseCases
const UseCases = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentLikeUseCase,
];

@Module({
  imports: [
    // ↓ ДОБАВЛЕНО: CqrsModule
    CqrsModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CommentsController],
  // ↓ ИЗМЕНЕНО: добавили UseCases в providers
  providers: [CommentsService, ...UseCases],
  exports: [CommentsService],
})
export class CommentsModule {}
