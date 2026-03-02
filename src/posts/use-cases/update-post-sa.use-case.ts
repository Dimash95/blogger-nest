import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../post.schema';
import { Blog, BlogDocument } from '../../blogs/blog.schema';
import { UpdatePostSaDto } from '../dto/update-post-sa.dto';

export class UpdatePostSaCommand {
  constructor(
    public readonly blogId: string,
    public readonly postId: string,
    public readonly dto: UpdatePostSaDto,
  ) {}
}

@CommandHandler(UpdatePostSaCommand)
export class UpdatePostSaUseCase implements ICommandHandler<UpdatePostSaCommand> {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  async execute({ blogId, postId, dto }: UpdatePostSaCommand) {
    const blog = await this.blogModel.findById(blogId);
    if (!blog) throw new NotFoundException('Blog not found');

    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    await this.postModel.findByIdAndUpdate(postId, dto);
  }
}
