import Component, { hbs, tracked } from '@glimmerx/component';
import { service } from '@glimmerx/service';
import { on, action } from '@glimmerx/modifier';

import { Profile } from '../types';
import { APIService } from '../utils/api';

export interface FollowButtonArgs {
  user: Profile;
}

export class FollowButton extends Component<FollowButtonArgs> {
  @service private api!: APIService;

  @tracked private processing = false;
  @tracked private following = this.args.user.following;

  public static template = hbs`
    <button
      class="btn btn-sm btn{{if this.following '-' '-outline-'}}secondary action-btn {{if this.processing 'disabled'}}"
      {{on 'click' this.toggleFollowing}}
    >
      <i class="ion-{{if this.following 'minus' 'plus'}}-round"></i>
      &nbsp;
      {{if this.following 'Unfollow' 'Follow'}} {{@user.username}}
    </button>
  `;

  @action private async toggleFollowing(): Promise<void> {
    if (this.processing) return;

    let { username } = this.args.user;

    this.processing = true;
    try {
      let user = await this.api[this.following ? 'unfollowUser' : 'followUser'](username);
      this.following = user.following;
    } finally {
      this.processing = false;
    }
  }
}
