import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../post.schema';
import { Blog, BlogDocument } from '../../blogs/blog.schema';

export class DeletePostSaCommand {
  constructor(
    public readonly blogId: string,
    public readonly postId: string,
  ) {}
}

@CommandHandler(DeletePostSaCommand)
export class DeletePostSaUseCase implements ICommandHandler<DeletePostSaCommand> {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  async execute({ blogId, postId }: DeletePostSaCommand) {
    const blog = await this.blogModel.findById(blogId);
    if (!blog) throw new NotFoundException('Blog not found');

    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    await this.postModel.findByIdAndDelete(postId);
  }
}
