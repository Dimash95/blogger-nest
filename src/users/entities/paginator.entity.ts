export class Paginator<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}

export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
}
