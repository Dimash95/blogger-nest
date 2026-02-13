import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './blog.schema';
import { Post, PostDocument } from '../posts/post.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { BlogViewModel, Paginator } from './entities/blog-paginator.entity';
import { QueryPostsDto } from '../posts/dto/query-posts.dto';
import { PostViewModel } from '../posts/entities/post-paginator.entity';
import { CreatePostForBlogDto } from '../posts/dto/create-post-for-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async create(createBlogDto: CreateBlogDto) {
    const blog = await this.blogModel.create(createBlogDto);

    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }

  async findAll(query: QueryBlogsDto): Promise<Paginator<BlogViewModel>> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      query;

    const where = searchNameTerm
      ? { name: { $regex: searchNameTerm, $options: 'i' } }
      : {};

    const totalCount = await this.blogModel.countDocuments(where);

    const blogs = await this.blogModel
      .find(where)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: blogs.map((blog) => ({
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
      })),
    };
  }

  async findOne(id: string) {
    const blog = await this.blogModel.findById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const blog = await this.blogModel.findById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const updated = await this.blogModel.findByIdAndUpdate(id, updateBlogDto, {
      new: true,
    });

    return {
      id: updated!._id.toString(),
      name: updated!.name,
      description: updated?.description,
      websiteUrl: updated?.websiteUrl,
      createdAt: updated?.createdAt,
      isMembership: updated?.isMembership,
    };
  }

  async remove(id: string) {
    const blog = await this.blogModel.findById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    await this.blogModel.findByIdAndDelete(id);
  }

  async createPostForBlog(blogId: string, createPostDto: CreatePostForBlogDto) {
    const blog = await this.blogModel.findById(blogId);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const post = await this.postModel.create({
      ...createPostDto,
      blogId,
    });

    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: blogId,
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

  async findPostsForBlog(
    blogId: string,
    query: QueryPostsDto,
  ): Promise<Paginator<PostViewModel>> {
    const blog = await this.blogModel.findById(blogId);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const totalCount = await this.postModel.countDocuments({ blogId });

    const posts = await this.postModel
      .find({ blogId })
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: posts.map((post) => ({
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId.toString(),
        blogName: blog.name,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      })),
    };
  }
}
