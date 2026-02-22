import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../post.schema';

export class DeletePostCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async execute({ id }: DeletePostCommand) {
    const post = await this.postModel.findById(id);

    if (!post) throw new NotFoundException('Post not found');

    await this.postModel.findByIdAndDelete(id);
    // delete возвращает void (204)
  }
}
