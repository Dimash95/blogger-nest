import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../blog.schema';
import { UpdateBlogDto } from '../dto/update-blog.dto';

export class UpdateBlogCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async execute({ id, dto }: UpdateBlogCommand) {
    const blog = await this.blogModel.findById(id);

    if (!blog) throw new NotFoundException('Blog not found');

    await this.blogModel.findByIdAndUpdate(id, dto);
  }
}
