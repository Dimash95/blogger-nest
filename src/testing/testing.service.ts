import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../comments/comment.schema';
import { Post, PostDocument } from '../posts/post.schema';
import { User, UserDocument } from '../users/user.schema';
import { Blog, BlogDocument } from '../blogs/blog.schema';

@Injectable()
export class TestingService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  async deleteAllData() {
    await this.commentModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.blogModel.deleteMany({});
    return { message: 'All data has been deleted' };
  }
}
