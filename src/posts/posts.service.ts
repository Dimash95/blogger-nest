import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './post.schema';
import { Blog, BlogDocument } from '../blogs/blog.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { Paginator, PostViewModel } from './entities/post-paginator.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  private formatPostWithLikes(post: any, blogName: string): PostViewModel {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }

  async create(createPostDto: CreatePostDto) {
    const blog = await this.blogModel.findById(createPostDto.blogId);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const post = await this.postModel.create(createPostDto);

    return this.formatPostWithLikes(post, blog.name);
  }

  async findAll(query: QueryPostsDto): Promise<Paginator<PostViewModel>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const totalCount = await this.postModel.countDocuments();

    const sort: any = { [sortBy]: sortDirection === 'asc' ? 1 : -1 };

    const posts = await this.postModel
      .find()
      .sort(sort)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const pagesCount = Math.ceil(totalCount / pageSize);

    const items = await Promise.all(
      posts.map(async (post) => {
        const blog = await this.blogModel.findById(post.blogId);
        return this.formatPostWithLikes(post, blog?.name || '');
      }),
    );

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const blog = await this.blogModel.findById(post.blogId);

    return this.formatPostWithLikes(post, blog?.name || '');
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (updatePostDto.blogId) {
      const blog = await this.blogModel.findById(updatePostDto.blogId);
      if (!blog) {
        throw new NotFoundException('Blog not found');
      }
    }

    const updatedPost = await this.postModel.findByIdAndUpdate(
      id,
      updatePostDto,
      { new: true },
    );

    const blog = await this.blogModel.findById(updatedPost!.blogId);

    return this.formatPostWithLikes(updatedPost!, blog?.name || '');
  }

  async remove(id: string) {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.postModel.findByIdAndDelete(id);
  }
}
