import Component, { hbs, tracked } from '@glimmerx/component';
import { on, action } from '@glimmerx/modifier';
import { service } from '@glimmerx/service';

import { User } from '../types';
import RequireUser from '../components/RequireUser';
import { gatherFormData } from '../utils/helpers';
import { APIService } from '../utils/api';
import ErrorMessages from '../components/ErrorMessages';
import { RoutingService } from '../utils/routing';

export interface SettingsPageArgs {
  currentUser: User | null;
}

export default class SettingsPage extends Component<SettingsPageArgs> {
  @service private api!: APIService;
  @service private routing!: RoutingService;

  @tracked private error: unknown;

  @action private async updateSettings(data: Record<string, string | null>): Promise<void> {
    try {
      await this.api.updateUser(data);
      this.error = null;
    } catch (error) {
      this.error = error;
    }
  }

  @action private async logOut(): Promise<void> {
    await this.api.logOut();
    this.routing.transitionTo('home');
  }

  public static template = hbs`
    <div class="settings-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <RequireUser>
              <h1 class="text-xs-center">Your Settings</h1>

              <ErrorMessages @error={{this.error}} />

              <form {{on 'submit' (gatherFormData this.updateSettings)}}>
                <fieldset>
                    <fieldset class="form-group">
                      <input
                        class="form-control form-control-lg"
                        type="text"
                        placeholder="URL of profile picture"
                        value={{@currentUser.image}}
                        name="image"
                      >
                    </fieldset>
                    <fieldset class="form-group">
                      <input
                        class="form-control form-control-lg"
                        type="text"
                        placeholder="Your Name"
                        value={{@currentUser.username}}
                        name="username"
                      >
                    </fieldset>
                    <fieldset class="form-group">
                      <textarea
                        class="form-control form-control-lg"
                        rows="8"
                        placeholder="Short bio about you"
                        name="bio"
                      >{{@currentUser.bio}}</textarea>
                    </fieldset>
                    <fieldset class="form-group">
                      <input
                        class="form-control form-control-lg"
                        type="text"
                        placeholder="Email"
                        value={{@currentUser.email}}
                        name="email"
                      >
                    </fieldset>
                    <fieldset class="form-group">
                      <input
                        class="form-control form-control-lg"
                        type="password"
                        placeholder="Password"
                        name="password"
                      >
                    </fieldset>
                    <button class="btn btn-lg btn-primary pull-xs-right">
                      Update Settings
                    </button>
                </fieldset>
              </form>

              <hr>

              <button class="btn btn-outline-danger" {{on 'click' this.logOut}}>
                Or click here to log out.
              </button>
            </RequireUser>
          </div>
        </div>
      </div>
    </div>
  `;
}
