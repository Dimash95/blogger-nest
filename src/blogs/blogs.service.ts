import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './blog.schema';
import { Post, PostDocument, PostLike } from '../posts/post.schema';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { BlogViewModel, Paginator } from './entities/blog-paginator.entity';
import { QueryPostsDto } from '../posts/dto/query-posts.dto';
import { PostViewModel } from '../posts/entities/post-paginator.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async findAll(query: QueryBlogsDto): Promise<Paginator<BlogViewModel>> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      query;

    const filter = searchNameTerm
      ? { name: { $regex: searchNameTerm, $options: 'i' } }
      : {};

    const totalCount = await this.blogModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);

    const blogs = await this.blogModel
      .find(filter)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

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

    if (!blog) throw new NotFoundException('Blog not found');

    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }

  async findPostsForBlog(
    blogId: string,
    query: QueryPostsDto,
    userId?: string,
  ): Promise<Paginator<PostViewModel>> {
    const blog = await this.blogModel.findById(blogId);
    if (!blog) throw new NotFoundException('Blog not found');

    const { sortBy, sortDirection, pageNumber, pageSize } = query;
    const totalCount = await this.postModel.countDocuments({ blogId });
    const pagesCount = Math.ceil(totalCount / pageSize);

    const posts = await this.postModel
      .find({ blogId })
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: posts.map((post) => {
        const likes: PostLike[] = post.likes || [];

        // ↓ ИЗМЕНЕНО: считаем лайки
        const likesCount = likes.filter((l) => l.status === 'Like').length;
        const dislikesCount = likes.filter(
          (l) => l.status === 'Dislike',
        ).length;

        // ↓ ИЗМЕНЕНО: статус текущего юзера
        const myStatus = userId
          ? likes.find((l) => l.userId.toString() === userId)?.status || 'None'
          : 'None';

        // ↓ ИЗМЕНЕНО: последние 3 лайка
        const newestLikes = likes
          .filter((l) => l.status === 'Like')
          .sort(
            (a, b) =>
              new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
          )
          .slice(0, 3)
          .map((l) => ({
            addedAt: l.addedAt,
            userId: l.userId,
            login: l.userLogin,
          }));

        return {
          id: post._id.toString(),
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId.toString(),
          blogName: blog.name,
          createdAt: post.createdAt,
          extendedLikesInfo: {
            likesCount,
            dislikesCount,
            myStatus,
            newestLikes,
          },
        };
      }),
    };
  }
}
