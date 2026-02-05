export class Paginator<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}

export class CommentatorInfo {
  userId: string;
  userLogin: string;
}

export class LikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: string; // "None" | "Like" | "Dislike"
}

export class CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: LikesInfo;
}
