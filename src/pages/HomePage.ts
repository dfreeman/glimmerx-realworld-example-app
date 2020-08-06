import Component, { hbs, tracked } from '@glimmerx/component';
import { fn } from '@glimmerx/helper';
import { action } from '@glimmerx/modifier';
import { service } from '@glimmerx/service';

import { User } from '../types';
import { eq, not, is } from '../utils/helpers';
import Await from '../components/Await';
import { APIService } from '../utils/api';
import ArticleList, { ArticleLoader } from '../components/ArticleList';
import FakeLink from '../components/FakeLink';

export interface HomePageArgs {
  currentUser: User | null;
}

type TabState = { tab: 'your-feed' } | { tab: 'global-feed' } | { tab: 'tag'; tag: string };

export default class HomePage extends Component<HomePageArgs> {
  @service private api!: APIService;
  @tracked private tabState: TabState = { tab: this.api.isLoggedIn ? 'your-feed' : 'global-feed' };

  @action private showTab(tab: string): void {
    if (tab === 'your-feed' || tab === 'global-feed') {
      this.tabState = { tab };
    } else {
      this.tabState = { tab: 'tag', tag: tab };
    }
  }

  private get articleLoader(): ArticleLoader {
    if (this.tabState.tab === 'your-feed') {
      return (offset, limit) => this.api.listFeedArticles({ limit, offset });
    } else if (this.tabState.tab === 'global-feed') {
      return (offset, limit) => this.api.listArticles({ limit, offset });
    } else {
      let { tag } = this.tabState;
      return (offset, limit) => this.api.listArticles({ tag, limit, offset });
    }
  }

  public static template = hbs`
    <div class="home-page">
      <div class="banner">
        <div class="container">
          <h1 class="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>

      <div class="container page">
        <div class="row">
          <div class="col-md-9">
            <div class="feed-toggle">
              <ul class="nav nav-pills outline-active">
                <li class="nav-item">
                  <FakeLink
                    @disabled={{not @currentUser}}
                    @active={{eq this.tabState.tab 'your-feed'}}
                    @onClick={{fn this.showTab 'your-feed'}}
                  >
                    Your Feed
                  </FakeLink>
                </li>
                <li class="nav-item">
                  <FakeLink @active={{eq this.tabState.tab 'global-feed'}} @onClick={{fn this.showTab 'global-feed'}}>
                    Global Feed
                  </FakeLink>
                </li>
                {{#if (is this.tabState 'tab' 'tag')}}
                  {{#let this.tabState.tag as |tag|}}
                    <li class="nav-item">
                      <FakeLink @active={{true}}>
                        #{{tag}}
                      </FakeLink>
                    </li>
                  {{/let}}
                {{/if}}
              </ul>
            </div>

            <ArticleList @loadArticles={{this.articleLoader}} />
          </div>

          <div class="col-md-3">
            <TagsPanel @showTagPosts={{this.showTab}} />
          </div>
        </div>
      </div>
    </div>
  `;
}

interface TagsPanelArgs {
  showTagPosts: (tag: string) => void;
}

class TagsPanel extends Component<TagsPanelArgs> {
  @service private api!: APIService;

  private tags = this.api.getTags();

  public static template = hbs`
    <div class="sidebar">
      <p>Popular Tags</p>

      <Await @promise={{this.tags}}>
        <:pending>
          Loading tags...
        </:pending>

        <:rejected>
          Uh oh! Something went wrong.
        </:rejected>

        <:resolved as |tags|>
          {{#if tags.length}}
            <div class="tag-list">
              {{#each tags as |tag|}}
                <FakeLink class="tag-pill tag-default" @onClick={{fn @showTagPosts tag}}>
                  {{tag}}
                </FakeLink>
              {{/each}}
            </div>
          {{else}}
            <div class="post-preview">No tags are here... yet.</div>
          {{/if}}
        </:resolved>
      </Await>
    </div>
  `;
}
