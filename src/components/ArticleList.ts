import Component, { tracked } from '@glint/environment-glimmerx/component';
import { action } from '@glint/environment-glimmerx/modifier';
import { fn } from '@glint/environment-glimmerx/helper';
import { hbs } from '@glimmerx/component';

import { Paginated, Article } from '../types';
import { LinkTo } from '../utils/routing';
import { range, eq, humanizeDate, onChange } from '../utils/helpers';
import FakeLink from './FakeLink';
import Await from './Await';
import FavoriteButton from './FavoriteButton';

export type ArticleLoader = (offset: number, limit: number) => Promise<Paginated<Article>>;

export interface ArticleListSignature {
  Args: { loadArticles: ArticleLoader };
}

export default class ArticleList extends Component<ArticleListSignature> {
  @tracked private offset = 0;
  @tracked private limit = 10;

  @action private updatePage(page: number): void {
    this.offset = (page - 1) * this.limit;
  }

  private get articles(): Promise<Paginated<Article>> {
    return this.args.loadArticles(this.offset, this.limit);
  }

  public static template = hbs`
    {{onChange @loadArticles (fn this.updatePage 1)}}

    <Await @promise={{this.articles}}>
      <:pending as |previous|>
        {{#if previous.total}}
          <Articles @articles={{previous}} @onPageChange={{this.updatePage}} />
        {{else}}
          <div class="article-preview">Loading articles...</div>
        {{/if}}
      </:pending>

      <:rejected>
        <div class="article-preview">Oops! Something went wrong.</div>
      </:rejected>

      <:resolved as |response|>
        <Articles @articles={{response}} @onPageChange={{this.updatePage}} />
      </:resolved>
    </Await>
  `;
}

interface ArticlesSignature {
  Args: {
    articles: Paginated<Article>;
    onPageChange: (page: number) => void;
  };
}

class Articles extends Component<ArticlesSignature> {
  public static template = hbs`
    {{#if @articles.items.length}}
      {{#each @articles.items key="slug" as |article|}}
        <div class="article-preview">
          <div class="article-meta">
            <LinkTo @route="profile" @params={{article.author.username}}>
              <img src={{article.author.image}}>
            </LinkTo>

            <div class="info">
              <LinkTo class="author" @route="profile" @params={{article.author.username}}>
                {{article.author.username}}
              </LinkTo>
              <span class="date">{{humanizeDate article.createdAt}}</span>
            </div>

            <FavoriteButton @article={{article}} @mini={{true}} class="pull-xs-right" />
          </div>

          <LinkTo @route="article" @params={{article.slug}} class="preview-link">
            <h1>{{article.title}}</h1>
            <p>{{article.description}}</p>
            <span>Read more...</span>

            {{#if article.tagList.length}}
              <ul class="tag-list">
                {{#each article.tagList as |tag|}}
                  <li class="tag-default tag-pill tag-outline">{{tag}}</li>
                {{/each}}
              </ul>
            {{/if}}
          </LinkTo>
        </div>
      {{/each}}

      <Pagination
        @data={{@articles}}
        @onChangePage={{@onPageChange}}
      />
    {{else}}
      <div class="article-preview">No articles are here... yet.</div>
    {{/if}}
  `;
}

interface PaginationSignature {
  Args: {
    data: Paginated<unknown>;
    onChangePage: (page: number) => void;
  };
}

class Pagination extends Component<PaginationSignature> {
  private get lastPage(): number {
    let { limit, total } = this.args.data;
    return Math.floor(total / limit) + 1;
  }

  private get currentPage(): number {
    let { limit, offset } = this.args.data;
    return Math.floor(offset / limit) + 1;
  }

  public static template = hbs`
    <nav>
      <ul class="pagination">
        {{#each (range 1 this.lastPage) as |page|}}
          <li class="page-item {{if (eq page this.currentPage) 'active'}}">
            <FakeLink class="page-link" @onClick={{fn @onChangePage page}}>{{page}}</FakeLink>
          </li>
        {{/each}}
      </ul>
    </nav>
  `;
}
