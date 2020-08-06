import Component, { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';

import { APIService } from '../utils/api';

export default class RequireUser extends Component {
  @service private api!: APIService;

  public static template = hbs`
    {{#if this.api.isLoggedIn}}
      {{yield}}
    {{else}}
      You need to be logged in to see this page.
    {{/if}}
  `;
}
