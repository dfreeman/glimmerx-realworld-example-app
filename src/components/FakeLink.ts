import Component, { hbs } from '@glimmerx/component';
import { on, action } from '@glimmerx/modifier';

export interface FakeLinkArgs {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

// For when the mocks call for a link, but it doesn't actually...
// go anywhere 🙃

export default class FakeLink extends Component<FakeLinkArgs> {
  public static template = hbs`
    <a
      href=""
      class="nav-link {{if @active 'active'}} {{if @disabled 'disabled'}}"
      {{on 'click' this.clicked}}
      ...attributes
    >
      {{yield}}
    </a>
  `;

  @action private clicked(event: MouseEvent): void {
    event.preventDefault();

    if (!this.args.disabled) {
      this.args.onClick?.();
    }
  }
}
