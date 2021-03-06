import Component from '@glint/environment-glimmerx/component';
import { on, action } from '@glint/environment-glimmerx/modifier';
import { hbs } from '@glimmerx/component';

export interface FakeLinkSignature {
  Element: HTMLAnchorElement;
  Args: {
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
  };
  Yields: { default: [] };
}

// For when the mocks call for a link, but it doesn't actually...
// go anywhere 🙃

export default class FakeLink extends Component<FakeLinkSignature> {
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
