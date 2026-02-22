import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../post.schema';
import { Blog, BlogDocument } from '../../blogs/blog.schema';
import { UpdatePostDto } from '../dto/update-post.dto';

export class UpdatePostCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  async execute({ id, dto }: UpdatePostCommand) {
    const post = await this.postModel.findById(id);

    if (!post) throw new NotFoundException('Post not found');

    // Если меняется blogId — проверяем что новый блог существует
    if (dto.blogId) {
      const blog = await this.blogModel.findById(dto.blogId);
      if (!blog) throw new NotFoundException('Blog not found');
    }

    await this.postModel.findByIdAndUpdate(id, dto);
    // update возвращает void (204), поэтому ничего не возвращаем
  }
}
