import Component, { tracked } from '@glint/environment-glimmerx/component';
import { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';

import { is } from './helpers';

export type RecognizedRoute =
  | { name: 'home' }
  | { name: 'login' }
  | { name: 'register' }
  | { name: 'settings' }
  | { name: 'editor'; slug?: string }
  | { name: 'article'; slug: string }
  | { name: 'profile'; user: string }
  | { name: 'favorites'; user: string };

export type RouteName = RecognizedRoute['name'];

export interface LinkToSignature {
  Args: {
    route: RouteName;
    params?: string | Array<string>;
  };
  Yields: { default: [] };
}

export class LinkTo extends Component<LinkToSignature> {
  @service private routing!: RoutingService;

  private get path(): string {
    return serialize(this.args.route, this.args.params);
  }

  public static template = hbs`
    <a
      href="#/{{this.path}}"
      class={{if (is this.routing.activeRoute 'name' @route) 'active'}}
      ...attributes
    >
      {{yield}}
    </a>
  `;
}

export class RoutingService {
  @tracked public activeRoute = recognize();

  public constructor() {
    addEventListener('popstate', this.locationChanged);
  }

  public transitionTo(route: RouteName, params: string | Array<string> = []): void {
    location.hash = `#/${serialize(route, params)}`;
  }

  public destroy(): void {
    removeEventListener('popstate', this.locationChanged);
  }

  private locationChanged = (): void => {
    this.activeRoute = recognize();
  };
}

function serialize(route: RouteName, params: string | Array<string> = []): string {
  let paramsArray = typeof params === 'string' ? [params] : params;

  switch (route) {
    case 'home':
      return '';
    case 'profile':
      return `@${paramsArray[0]}`;
    case 'favorites':
      return `@${paramsArray[0]}/favorites`;
    default:
      return [route, ...paramsArray].join('/');
  }
}

function recognize(): RecognizedRoute {
  const [route, ...segments] = location.hash.replace(/^#\/?/, '').split('/');
  if (route.startsWith('@')) {
    return {
      name: segments[0] === 'favorites' ? 'favorites' : 'profile',
      user: route.slice(1),
    };
  }

  switch (route) {
    case '':
      return { name: 'home' };

    case 'login':
    case 'register':
    case 'settings':
      return { name: route };

    case 'editor':
      return { name: route, slug: segments[0] };

    case 'article':
      return { name: route, slug: segments[0] };
  }

  console.warn('Unrecognized route', [route, ...segments].join('/'));

  return { name: 'home' };
}
