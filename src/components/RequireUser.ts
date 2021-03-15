import Component from '@glint/environment-glimmerx/component';
import { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';

import { APIService } from '../utils/api';

export interface RequireUserSignature {
  Yields: { default: [] };
}

export default class RequireUser extends Component<RequireUserSignature> {
  @service private api!: APIService;

  public static template = hbs`
    {{#if this.api.isLoggedIn}}
      {{yield}}
    {{else}}
      You need to be logged in to see this page.
    {{/if}}
  `;
}
