import Component, { hbs, tracked } from '@glimmerx/component';
import { service } from '@glimmerx/service';
import { on, action } from '@glimmerx/modifier';
import { fn } from '@glimmerx/helper';

import { Article, User, Comment } from '../types';
import { APIService } from '../utils/api';
import Await from '../components/Await';
import { LinkTo } from '../utils/routing';
import { humanizeDate, gatherFormData, eq, markdown } from '../utils/helpers';
import { FollowButton } from '../components/FollowButton';
import FavoriteButton from '../components/FavoriteButton';
import { RoutingService } from '../utils/routing';

export interface ArticlePageArgs {
  slug: string;
  currentUser: User | null;
}

export default class ArticlePage extends Component<ArticlePageArgs> {
  @service private api!: APIService;

  private get article(): Promise<Article> {
    return this.api.getArticle(this.args.slug);
  }

  public static template = hbs`
    <Await @promise={{this.article}}>
      <:resolved as |article|>
        <div class="article-page">
          <div class="banner">
            <div class="container">
              <h1>{{article.title}}</h1>

              <ArticleMeta @article={{article}} @currentUser={{@currentUser}} />
            </div>
          </div>

          <div class="container page">
            <div class="row article-content">
              <div class="col-xs-12">
                <div>{{{markdown article.body}}}</div>

                <ul class="tag-list">
                  {{#each article.tagList as |tag|}}
                    <li class="tag-default tag-pill tag-outline">{{tag}}</li>
                  {{/each}}
                </ul>
              </div>
            </div>

            <hr />

            <div class="article-actions"></div>

            <div class="row">
              <div class="col-xs-12 col-md-8 offset-md-2">
                <Comments @article={{article}} @user={{@currentUser}} />
              </div>
            </div>
          </div>
        </div>
      </:resolved>
    </Await>
  `;
}

interface CommentsArgs {
  user: User | null;
  article: Article;
}

class Comments extends Component<CommentsArgs> {
  @service private api!: APIService;

  @tracked private comments = this.api.getComments(this.args.article.slug);

  @action private async postComment(
    data: Record<string, string | null>,
    form: HTMLFormElement
  ): Promise<void> {
    try {
      await this.api.addComment(this.args.article.slug, data.body ?? '');
      form.reset();
      this.comments = this.api.getComments(this.args.article.slug);
    } catch {
      // The reference implementation seemingly just does nothing
    }
  }

  @action private async deleteComment(comment: Comment): Promise<void> {
    try {
      await this.api.deleteComment(this.args.article.slug, comment.id);
      this.comments = this.api.getComments(this.args.article.slug);
    } catch {
      // Again, the reference implementation seemingly just drops errors
    }
  }

  public static template = hbs`
    {{#if @user}}
      <form class="card comment-form" {{on 'submit' (gatherFormData this.postComment)}}>
        <div class="card-block">
          <textarea class="form-control" placeholder="Write a comment..." rows="3" name="body"></textarea>
        </div>
        <div class="card-footer">
          <img src={{@user.image}} class="comment-author-img" />
          <button class="btn btn-sm btn-primary">
            Post Comment
          </button>
        </div>
      </form>
    {{/if}}

    <Await @promise={{this.comments}}>
      <:resolved as |comments|>
        <CommentsList @user={{@user}} @comments={{comments}} @deleteComment={{this.deleteComment}} />
      </:resolved>

      <:pending as |previous|>
        {{#if previous}}
          <CommentsList @user={{@user}} @comments={{previous}} @deleteComment={{this.deleteComment}} />
        {{/if}}
      </:pending>
    </Await>
  `;
}

interface ArticleMetaArgs {
  article: Article;
  currentUser: User | null;
}

class ArticleMeta extends Component<ArticleMetaArgs> {
  @service private api!: APIService;
  @service private routing!: RoutingService;

  @tracked private isDeleting = false;

  @action private async deleteArticle(): Promise<void> {
    this.isDeleting = true;
    try {
      await this.api.deleteArticle(this.args.article.slug);
      this.routing.transitionTo('home');
    } catch {
      // ¯\_(ツ)_/¯
    } finally {
      this.isDeleting = false;
    }
  }

  public static template = hbs`
    <div class="article-meta">
      <LinkTo @route="profile" @params={{@article.author.username}}>
        <img src={{@article.author.image}} />
      </LinkTo>

      <div class="info">
        <LinkTo @route="profile" @params={{@article.author.username}} class="author">
          {{@article.author.username}}
        </LinkTo>
        <span class="date">{{humanizeDate @article.createdAt}}</span>
      </div>

      {{#if (eq @article.author.username @currentUser.username)}}
        <LinkTo @route="editor" @params={{@article.slug}} class="btn btn-outline-secondary btn-sm">
          <i class="ion-edit"></i> Edit Article
        </LinkTo>

        <button
          class="btn btn-outline-danger btn-sm"
          disabled={{this.isDeleting}}
          {{on 'click' this.deleteArticle}}
        >
          <i class="ion-trash-a"></i> Delete Article
        </button>
      {{else}}
        <FollowButton @user={{@article.author}} />
        <FavoriteButton @article={{@article}} />
      {{/if}}
    </div>
  `;
}

interface CommentsListArgs {
  comments: Array<Comment>;
  user: User | null;
  deleteComment: (comment: Comment) => void;
}

class CommentsList extends Component<CommentsListArgs> {
  public static template = hbs`
    {{#each @comments key="id" as |comment|}}
      <div class="card">
        <div class="card-block">
          <p class="card-text">{{comment.body}}</p>
        </div>
        <div class="card-footer">
          <LinkTo @route="profile" @params={{comment.author.username}} class="comment-author">
            <img src="{{comment.author.image}}" class="comment-author-img" />
          </LinkTo>
          &nbsp;
          <LinkTo @route="profile" @params={{comment.author.username}} class="comment-author">
            {{comment.author.username}}
          </LinkTo>
          <span class="date-posted">{{humanizeDate comment.createdAt}}</span>
          <span class="mod-options">
            {{#if (eq comment.author.username @user.username)}}
              <i class="ion-trash-a" {{on 'click' (fn @deleteComment comment)}}></i>
            {{/if}}
          </span>
        </div>
      </div>
    {{/each}}
  `;
}
