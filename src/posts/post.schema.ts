import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

// ↓ ДОБАВЛЕНО: вложенная схема для каждого лайка
@Schema({ _id: false })
export class PostLike {
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

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

@Schema({ versionKey: false, collection: 'Post' })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Blog', required: true })
  blogId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  // ↓ ДОБАВЛЕНО: массив лайков
  @Prop({ type: [PostLikeSchema], default: [] })
  likes: PostLike[];
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});
