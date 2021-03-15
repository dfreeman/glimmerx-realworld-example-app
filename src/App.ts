import Component from '@glint/environment-glimmerx/component';
import { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';

import { RoutingService, LinkTo } from './utils/routing';
import { is } from './utils/helpers';
import { APIService } from './utils/api';
import Await from './components/Await';
import { User } from './types';

import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import ArticlePage from './pages/ArticlePage';
import EditorPage from './pages/EditorPage';

export default class App extends Component {
  public static template = hbs`
    <ResolveUserSession as |user|>
      <nav class="navbar navbar-light">
        <div class="container">
          <LinkTo @route="home" class="navbar-brand">conduit</LinkTo>
          <ul class="nav navbar-nav pull-xs-right">
            <li class="nav-item">
              <LinkTo @route="home" class="nav-link">Home</LinkTo>
            </li>
            {{#if user}}
              <li class="nav-item">
                <LinkTo @route="editor" class="nav-link"><i class="ion-compose"></i>&nbsp;New Article</LinkTo>
              </li>
              <li class="nav-item">
                <LinkTo @route="settings" class="nav-link"><i class="ion-gear-a"></i>&nbsp;Settings</LinkTo>
              </li>
              <li class="nav-item">
                <LinkTo @route="profile" @params={{user.username}} class="nav-link">&nbsp;{{user.username}}</LinkTo>
              </li>
            {{else}}
              <li class="nav-item">
                <LinkTo @route="login" class="nav-link">&nbsp;Sign in</LinkTo>
              </li>
              <li class="nav-item">
                <LinkTo @route="register" class="nav-link">&nbsp;Sign up</LinkTo>
              </li>
            {{/if}}
          </ul>
        </div>
      </nav>

      <ActivePageOutlet @user={{user}} />

      <footer>
        <div class="container">
          <LinkTo @route="home" class="logo-font">conduit</LinkTo>
          <span class="attribution">
            An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code
            &amp; design licensed under MIT.
          </span>
        </div>
      </footer>
    </ResolveUserSession>
  `;
}

interface ResolveUserSessionSignature {
  Yields: {
    default: [user: User | null];
  };
}

class ResolveUserSession extends Component<ResolveUserSessionSignature> {
  @service private api!: APIService;

  public static template = hbs`
    <Await @promise={{this.api.currentUser}} @expectSettledPromises={{false}}>
      <:resolved as |user|>
        {{yield user}}
      </:resolved>

      <:pending>
        {{! the reference implementation just shows a blank screen while the current user is loading }}
      </:pending>

      <:rejected>
        I mean I guess you've got a bad JWT in <code>localStorage</code> or something? Seems bad.
      </:rejected>
    </Await>
  `;
}

interface ActivePageOutletSignature {
  Args: { user: User | null };
}

class ActivePageOutlet extends Component<ActivePageOutletSignature> {
  @service private routing!: RoutingService;

  /*
   * GlimmerX currently has basically no support for dynamic component invocation,
   * unfortunately, so our 'router' is actually entirely static.
   */
  public static template = hbs`
    {{#let this.routing.activeRoute as |activeRoute|}}
      {{#if (is activeRoute 'name' 'login')}}
        <AuthPage />
      {{else if (is activeRoute 'name' 'register')}}
        <AuthPage @register={{true}} />
      {{else if (is activeRoute 'name' 'home')}}
        <HomePage @currentUser={{@user}} />}}
      {{else if (is activeRoute 'name' 'settings')}}
        <SettingsPage @currentUser={{@user}} />
      {{else if (is activeRoute 'name' 'editor')}}
        <EditorPage @slug={{activeRoute.slug}} />
      {{else if (is activeRoute 'name' 'article')}}
        <ArticlePage @slug={{activeRoute.slug}} @currentUser={{@user}} />
      {{else}}
        <ProfilePage
          @username={{activeRoute.user}}
          @currentUser={{@user}}
          @favorites={{is activeRoute 'name' 'favorites'}}
        />
      {{/if}}
    {{/let}}
  `;
}
