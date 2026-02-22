import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

// ↓ ДОБАВЛЕНО: вложенная схема для каждого лайка
@Schema({ _id: false })
export class CommentLike {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;

  // ↓ None | Like | Dislike
  @Prop({ required: true })
  status: string;

  @Prop({ type: Date, default: Date.now })
  addedAt: Date;
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

@Schema({ versionKey: false, collection: 'Comment' })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  // ↓ ДОБАВЛЕНО: массив лайков
  @Prop({ type: [CommentLikeSchema], default: [] })
  likes: CommentLike[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});
