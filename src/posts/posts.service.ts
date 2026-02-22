import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './post.schema';
import { Blog, BlogDocument } from '../blogs/blog.schema';
// ↓ УДАЛЕНО: CreatePostDto, UpdatePostDto — они больше не нужны в сервисе
import { QueryPostsDto } from './dto/query-posts.dto';
import { Paginator, PostViewModel } from './entities/post-paginator.entity';
import { PostLike } from './post.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  private formatPostWithLikes(
    post: any,
    blogName: string,
    userId?: string,
  ): PostViewModel {
    const likes: PostLike[] = post.likes || [];

    // ↓ ИЗМЕНЕНО: считаем лайки из массива
    const likesCount = likes.filter((l) => l.status === 'Like').length;
    const dislikesCount = likes.filter((l) => l.status === 'Dislike').length;

    // ↓ ИЗМЕНЕНО: ищем статус текущего юзера
    const myStatus = userId
      ? (likes.find((l) => l.userId === userId)?.status as string) || 'None'
      : 'None';

    // ↓ ИЗМЕНЕНО: последние 3 лайка отсортированные по дате
    const newestLikes = likes
      .filter((l) => l.status === 'Like')
      .sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
      )
      .slice(0, 3)
      .map((l) => ({
        addedAt: l.addedAt,
        userId: l.userId.toString(),
        login: l.userLogin,
      }));

    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes,
      },
    };
  }

  // ↓ ИЗМЕНЕНО: добавили опциональный userId в findAll
  async findAll(
    query: QueryPostsDto,
    userId?: string,
  ): Promise<Paginator<PostViewModel>> {
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
        // ↓ ИЗМЕНЕНО: передаём userId
        return this.formatPostWithLikes(post, blog?.name || '', userId);
      }),
    );

    return { pagesCount, page: pageNumber, pageSize, totalCount, items };
  }

  // ↓ ИЗМЕНЕНО: добавили опциональный userId в findOne
  async findOne(id: string, userId?: string) {
    const post = await this.postModel.findById(id);

    if (!post) throw new NotFoundException('Post not found');

    const blog = await this.blogModel.findById(post.blogId);
    // ↓ ИЗМЕНЕНО: передаём userId
    return this.formatPostWithLikes(post, blog?.name || '', userId);
  }
}
