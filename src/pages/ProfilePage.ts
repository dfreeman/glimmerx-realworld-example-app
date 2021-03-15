import Component from '@glint/environment-glimmerx/component';
import { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';

import { APIService } from '../utils/api';
import { Profile, User } from '../types';
import Await from '../components/Await';
import { eq } from '../utils/helpers';
import ArticleList, { ArticleLoader } from '../components/ArticleList';
import { LinkTo } from '../utils/routing';
import { FollowButton } from '../components/FollowButton';

export interface ProfilePageSignature {
  Args: {
    currentUser: User | null;
    username: string;
    favorites?: boolean;
  };
}

export default class ProfilePage extends Component<ProfilePageSignature> {
  @service private api!: APIService;

  private lastFetchedProfile?: { username: string; promise: Promise<Profile> };

  private get tab(): 'mine' | 'favorites' {
    return this.args.favorites ? 'favorites' : 'mine';
  }

  private get profile(): Promise<Profile> {
    let { username } = this.args;

    if (this.lastFetchedProfile?.username !== this.args.username) {
      this.lastFetchedProfile = {
        username,
        promise: this.api.getProfile(username),
      };
    }

    return this.lastFetchedProfile.promise;
  }

  private get articleLoader(): ArticleLoader {
    let { username } = this.args;
    if (this.tab === 'mine') {
      return (offset, limit) => this.api.listArticles({ author: username, offset, limit });
    } else {
      return (offset, limit) => this.api.listArticles({ favorited: username, offset, limit });
    }
  }

  public static template = hbs`
    <Await @promise={{this.profile}}>
      <:rejected>
        Uh oh!
      </:rejected>

      <:resolved as |user|>
        <div class="profile-page">
          <div class="user-info">
            <div class="container">
              <div class="row">
                <div class="col-xs-12 col-md-10 offset-md-1">
                  <img src={{user.image}} class="user-img" />
                  <h4>{{user.username}}</h4>
                  <p>
                    {{user.bio}}
                  </p>

                  {{#if (eq @currentUser.username @username)}}
                    <LinkTo @route="settings" class="btn btn-sm btn-outline-secondary action-btn">
                      <i class="ion-gear-a"></i> Edit Profile Settings
                    </LinkTo>
                  {{else if @currentUser}}
                    <FollowButton @user={{user}} />
                  {{/if}}
                </div>
              </div>
            </div>
          </div>

          <div class="container">
            <div class="row">
              <div class="col-xs-12 col-md-10 offset-md-1">
                <div class="articles-toggle">
                  <ul class="nav nav-pills outline-active">
                    <li class="nav-item">
                      <LinkTo @route="profile" @params={{@username}} class="nav-link">
                        My Articles
                      </LinkTo>
                    </li>
                    <li class="nav-item">
                      <LinkTo @route="favorites" @params={{@username}} class="nav-link">
                        Favorited Articles
                      </LinkTo>
                    </li>
                  </ul>
                </div>

                <ArticleList @loadArticles={{this.articleLoader}} />
              </div>
            </div>
          </div>
        </div>
      </:resolved>
    </Await>
  `;
}
