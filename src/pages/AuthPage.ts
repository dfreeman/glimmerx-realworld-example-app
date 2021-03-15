import Component, { tracked } from '@glint/environment-glimmerx/component';
import { hbs } from '@glimmerx/component';
import { on, action } from '@glint/environment-glimmerx/modifier';
import { service } from '@glimmerx/service';

import { LinkTo, RoutingService } from '../utils/routing';
import { APIService } from '../utils/api';
import { gatherFormData } from '../utils/helpers';
import ErrorMessages from '../components/ErrorMessages';

export interface AuthPageSignature {
  Args: { register?: boolean };
}

export default class AuthPage extends Component<AuthPageSignature> {
  @service private api!: APIService;
  @service private routing!: RoutingService;

  @tracked private error: unknown;

  public static template = hbs`
    <div class="auth-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">Sign {{if @register 'Up' 'In'}}</h1>
            <p class="text-xs-center">
              {{#if @register}}
                <LinkTo @route="login">Have an account?</LinkTo>
              {{else}}
                <LinkTo @route="register">Need an account?</LinkTo>
              {{/if}}
            </p>

            <ErrorMessages @error={{this.error}} />

            <form {{on 'submit' (gatherFormData this.submit)}}>
              {{#if @register}}
                <fieldset class="form-group">
                  <input class="form-control form-control-lg" type="text" placeholder="Username" name="username">
                </fieldset>
              {{/if}}

              <fieldset class="form-group">
                <input class="form-control form-control-lg" type="text" placeholder="Email" name="email">
              </fieldset>

              <fieldset class="form-group">
                <input class="form-control form-control-lg" type="password" placeholder="Password" name="password">
              </fieldset>

              <button class="btn btn-lg btn-primary pull-xs-right">
                Sign {{if @register 'up' 'in'}}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  @action
  private async submit(data: Record<string, string | null>): Promise<void> {
    try {
      if (this.args.register) {
        await this.api.createUser(data);
      } else {
        await this.api.logIn(data);
      }

      this.routing.transitionTo('home');
    } catch (error) {
      this.error = error;
    }
  }
}
