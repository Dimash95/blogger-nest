import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../blog.schema';
import { Post, PostDocument } from '../../posts/post.schema';
import { CreatePostForBlogDto } from '../../posts/dto/create-post-for-blog.dto';

export class CreatePostForBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly dto: CreatePostForBlogDto,
  ) {}
}

@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogUseCase implements ICommandHandler<CreatePostForBlogCommand> {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async execute({ blogId, dto }: CreatePostForBlogCommand) {
    const blog = await this.blogModel.findById(blogId);

    if (!blog) throw new NotFoundException('Blog not found');

    const post = await this.postModel.create({ ...dto, blogId });

    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId,
      blogName: blog.name,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }
}
