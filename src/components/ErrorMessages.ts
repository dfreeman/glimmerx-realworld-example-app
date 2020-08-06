import Component, { hbs } from '@glimmerx/component';

import { assert } from '../utils/debug';

export interface ErrorMessagesArgs {
  error: unknown;
}

export default class ErrorMessages extends Component<ErrorMessagesArgs> {
  private get errors(): Array<string> {
    let error = this.args.error as Record<string, unknown>;

    return Object.keys(error ?? {}).map((key) => {
      let messages = error[key];
      assert(Array.isArray(messages));
      return `${key} ${messages.join(', ')}`;
    });
  }

  public static template = hbs`
    {{#if this.errors.length}}
      <ul class="error-messages">
        {{#each this.errors as |error|}}
          <li>{{error}}</li>
        {{/each}}
      </ul>
    {{/if}}
  `;
}
