import { tracked } from '@glimmerx/component';
import { User, Profile, Article, Comment, Paginated } from '../types';

type UserResponse = {
  user: User;
};

type ProfileResponse = {
  profile: Profile;
};

type ArticleResponse = {
  article: Article;
};

type ArticlesResponse = {
  articles: Array<Article>;
  articlesCount: number;
};

type CommentResponse = {
  comment: Comment;
};

type CommentsResponse = {
  comments: Array<Comment>;
};

type TagsResponse = {
  tags: Array<string>;
};

type RequestOptions = {
  body?: unknown;
  method?: 'GET' | 'PUT' | 'POST' | 'DELETE';
  params?: Record<string, unknown>;
};

const JWT_KEY = 'conduit.jwt';

export class APIService {
  public constructor(private api: string) {}

  @tracked private jwt = localStorage.getItem(JWT_KEY);
  @tracked private userPromise: Promise<User> | null = null;

  public get isLoggedIn(): boolean {
    return Boolean(this.jwt);
  }

  public get currentUser(): Promise<User | null> {
    if (this.userPromise) {
      return this.userPromise;
    }

    if (this.jwt) {
      return (this.userPromise = this.request<UserResponse>('user').then((data) => data.user));
    }

    return Promise.resolve(null);
  }

  public async logIn(data: { email?: string; password?: string }): Promise<void> {
    let { user } = await this.request<UserResponse>('users/login', { body: { user: data } });
    this.setCurrentUser(user);
  }

  public async logOut(): Promise<void> {
    this.setCurrentUser(null);
  }

  public async createUser(data: {
    email?: string;
    username?: string;
    password?: string;
  }): Promise<void> {
    let { user } = await this.request<UserResponse>('users', { body: { user: data } });
    this.setCurrentUser(user);
  }

  public async updateUser(data: {
    email?: string;
    username?: string;
    password?: string;
    image?: string;
    bio?: string;
  }): Promise<void> {
    await this.request('user', { body: { user: data }, method: 'PUT' });
  }

  public async getProfile(username: string): Promise<Profile> {
    let { profile } = await this.request<ProfileResponse>(`profiles/${username}`);
    return profile;
  }

  public async followUser(username: string): Promise<Profile> {
    let { profile } = await this.request<ProfileResponse>(`profiles/${username}/follow`, {
      method: 'POST',
    });

    return profile;
  }

  public async unfollowUser(username: string): Promise<Profile> {
    let { profile } = await this.request<ProfileResponse>(`profiles/${username}/follow`, {
      method: 'DELETE',
    });

    return profile;
  }

  public async listArticles(params: {
    tag?: string;
    author?: string;
    favorited?: string;
    offset: number;
    limit: number;
  }): Promise<Paginated<Article>> {
    let response = await this.request<ArticlesResponse>('articles', { params });
    return {
      offset: params.offset,
      limit: params.limit,
      items: response.articles,
      total: response.articlesCount,
    };
  }

  public async listFeedArticles(params: {
    offset: number;
    limit: number;
  }): Promise<Paginated<Article>> {
    let response = await this.request<ArticlesResponse>('articles/feed', { params });
    return {
      offset: params.offset,
      limit: params.limit,
      items: response.articles,
      total: response.articlesCount,
    };
  }

  public async getArticle(slug: string): Promise<Article> {
    let { article } = await this.request<ArticleResponse>(`articles/${slug}`);
    return article;
  }

  public async createArticle(input: {
    title?: string | null;
    description?: string | null;
    body?: string | null;
    tagList?: Array<string> | null;
  }): Promise<Article> {
    let { article } = await this.request<ArticleResponse>('articles', { body: { article: input } });
    return article;
  }

  public async updateArticle(
    slug: string,
    input: {
      title?: string | null;
      description?: string | null;
      body?: string | null;
      tagList?: Array<string> | null;
    }
  ): Promise<Article> {
    let { article } = await this.request<ArticleResponse>(`articles/${slug}`, {
      body: { article: input },
    });

    return article;
  }

  public async deleteArticle(slug: string): Promise<void> {
    await this.request(`articles/${slug}`, { method: 'DELETE' });
  }

  public async addComment(slug: string, body: string): Promise<Comment> {
    let { comment } = await this.request<CommentResponse>(`articles/${slug}/comments`, {
      body: { comment: { body } },
    });

    return comment;
  }

  public async getComments(slug: string): Promise<Array<Comment>> {
    let { comments } = await this.request<CommentsResponse>(`articles/${slug}/comments`);
    return comments;
  }

  public async deleteComment(slug: string, id: number): Promise<void> {
    await this.request(`articles/${slug}/comments/${id}`, { method: 'DELETE' });
  }

  public async favoriteArticle(slug: string): Promise<Article> {
    let { article } = await this.request<ArticleResponse>(`articles/${slug}/favorite`, {
      method: 'POST',
    });

    return article;
  }

  public async unfavoriteArticle(slug: string): Promise<Article> {
    let { article } = await this.request<ArticleResponse>(`articles/${slug}/favorite`, {
      method: 'DELETE',
    });

    return article;
  }

  public async getTags(): Promise<Array<string>> {
    let { tags } = await this.request<TagsResponse>(`tags`);
    return tags;
  }

  private setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(JWT_KEY, user.token);
    } else {
      localStorage.removeItem(JWT_KEY);
    }

    this.jwt = user?.token ?? null;
    this.userPromise = user ? Promise.resolve(user) : null;
  }

  private async request<T>(
    path: string,
    { body, params, method = body ? 'POST' : 'GET' }: RequestOptions = {}
  ): Promise<T> {
    let headers: Record<string, string> = {};

    if (this.jwt) {
      headers['Authorization'] = `Token ${this.jwt}`;
    }

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    if (params) {
      let serialized = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(`${value}`)}`)
        .join('&');

      if (serialized) {
        path = `${path}?${serialized}`;
      }
    }

    let response = await fetch(`${this.api}/${path}`, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    let data = JSON.parse(await response.text());
    if (response.status >= 200 && response.status <= 299) {
      return data;
    } else {
      throw data.errors;
    }
  }
}
