import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../blog.schema';

export class DeleteBlogCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async execute({ id }: DeleteBlogCommand) {
    const blog = await this.blogModel.findById(id);

    if (!blog) throw new NotFoundException('Blog not found');

    await this.blogModel.findByIdAndDelete(id);
  }
}
