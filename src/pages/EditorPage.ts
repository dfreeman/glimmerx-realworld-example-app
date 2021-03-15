import Component, { tracked } from '@glint/environment-glimmerx/component';
import { hbs } from '@glimmerx/component';
import { action, on } from '@glint/environment-glimmerx/modifier';
import { service } from '@glimmerx/service';

import ErrorMessages from '../components/ErrorMessages';
import Await from '../components/Await';
import RequireUser from '../components/RequireUser';
import { Article } from '../types';
import { join, gatherFormData } from '../utils/helpers';
import { APIService } from '../utils/api';
import { RoutingService } from '../utils/routing';

export interface EditorPageSignature {
  Args: { slug?: string };
}

export default class EditorPage extends Component<EditorPageSignature> {
  @service private api!: APIService;
  @service private routing!: RoutingService;

  @tracked private error: unknown;
  @tracked private publishing = false;

  @action private async submitArticle(data: Record<string, string | null>): Promise<void> {
    let input = { ...data, tagList: data.tagList?.split(/,?\s+/) };

    this.publishing = true;
    try {
      let article: Article;
      if (this.args.slug) {
        article = await this.api.updateArticle(this.args.slug, input);
      } else {
        article = await this.api.createArticle(input);
      }
      this.error = null;
      this.routing.transitionTo('article', article.slug);
    } catch (error) {
      this.error = error;
    } finally {
      this.publishing = false;
    }
  }

  private get article(): Promise<Article | null> {
    return this.args.slug ? this.api.getArticle(this.args.slug) : Promise.resolve(null);
  }

  public static template = hbs`
    <RequireUser>
      <Await @promise={{this.article}}>
        <:resolved as |article|>
          <div class="editor-page">
            <div class="container page">
              <div class="row">
                <div class="col-md-10 offset-md-1 col-xs-12">
                  <ErrorMessages @error={{this.error}} />

                  <form {{on 'submit' (gatherFormData this.submitArticle)}}>
                    <fieldset>
                      <fieldset class="form-group">
                        <input
                          type="text"
                          class="form-control form-control-lg"
                          placeholder="Article Title"
                          name="title"
                          value={{article.title}}
                        >
                      </fieldset>
                      <fieldset class="form-group">
                        <input
                          type="text"
                          class="form-control"
                          placeholder="What's this article about?"
                          name="description"
                          value={{article.description}}
                        >
                      </fieldset>
                      <fieldset class="form-group">
                        <textarea
                          class="form-control"
                          rows="8"
                          placeholder="Write your article (in markdown)"
                          name="body"
                        >{{article.body}}</textarea>
                      </fieldset>
                      <fieldset class="form-group">
                        <input
                          type="text"
                          class="form-control"
                          placeholder="Enter tags"
                          name="tagList"
                          value={{if article (join article.tagList ', ')}}
                        >
                          <div class="tag-list">
                        </div>
                      </fieldset>
                      <button
                        class="btn btn-lg pull-xs-right btn-primary {{if this.publishing 'disabled'}}"
                        disabled={{this.publishing}}
                      >
                        Publish Article
                      </button>
                    </fieldset>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </:resolved>
      </Await>
    </RequireUser>
  `;
}
