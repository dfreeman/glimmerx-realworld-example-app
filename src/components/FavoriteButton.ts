import Component, { tracked } from '@glint/environment-glimmerx/component';
import { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';
import { action, on } from '@glint/environment-glimmerx/modifier';

import { APIService } from '../utils/api';
import { Article } from '../types';

export interface FavoriteButtonSignature {
  Element: HTMLButtonElement;
  Args: {
    /** The article to toggle favorite status for. */
    article: Article;
    /** Whether to display the button in its 'mini' format.  */
    mini?: boolean;
  };
}

export default class FavoriteButton extends Component<FavoriteButtonSignature> {
  @service private api!: APIService;

  @tracked private processing = false;
  @tracked private favorited = this.args.article.favorited;
  @tracked private count = this.args.article.favoritesCount;

  public static template = hbs`
    <button
      class="
        btn btn-sm
        {{if this.favorited 'btn-primary' 'btn-outline-primary'}}
        {{if this.disabled 'disabled'}}
      "
      ...attributes
      {{on 'click' this.toggleFavorite}}
    >
      <i class="ion-heart"></i>
      {{#if @mini}}
        {{this.count}}
      {{else}}
        {{if this.favorited 'Unfavorite' 'Favorite'}} Article ({{this.count}})
      {{/if}}
    </button>
  `;

  private get disabled(): boolean {
    return this.processing || !this.api.isLoggedIn;
  }

  @action private async toggleFavorite(): Promise<void> {
    if (this.disabled) return;

    let { slug } = this.args.article;

    this.processing = true;
    try {
      let article = await this.api[this.favorited ? 'unfavoriteArticle' : 'favoriteArticle'](slug);

      this.favorited = article.favorited;
      this.count = article.favoritesCount;
    } finally {
      this.processing = false;
    }
  }
}
