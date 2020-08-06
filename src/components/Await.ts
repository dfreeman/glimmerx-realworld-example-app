import Component, { hbs, tracked } from '@glimmerx/component';

import { is } from '../utils/helpers';

export type AsyncState<T> =
  | { state: 'pending'; previous: T | null }
  | { state: 'resolved'; value: T }
  | { state: 'rejected'; error: unknown };

export interface AwaitArgs<T> {
  promise: Promise<T>;
  expectSettledPromises?: boolean;
}

const PENDING = Symbol();

export default class Await<T> extends Component<AwaitArgs<T>> {
  @tracked private state: AsyncState<T> = { state: 'pending', previous: null };

  private lastPromise: Promise<T> | null = null;
  private get inner(): AsyncState<T> {
    this.revalidateState(
      this.args.promise,
      this.state.state === 'resolved' ? this.state.value : null
    );

    return this.state;
  }

  public static template = hbs`
    {{#if (is this.inner 'state' 'pending')}}
      {{yield this.inner.previous to='pending'}}
    {{else if (is this.inner 'state' 'resolved')}}
      {{yield this.inner.value to='resolved'}}
    {{else}}
      {{yield this.inner.error to='rejected'}}
    {{/if}}
  `;

  private async revalidateState(promise: Promise<T>, previous: T | null): Promise<void> {
    if (promise === this.lastPromise) return;

    this.lastPromise = promise;

    promise.then(
      (value) => this.maybeUpdate(promise, { state: 'resolved', value }),
      (error) => this.maybeUpdate(promise, { state: 'rejected', error })
    );

    // This slightly-odd dance ensures that if we're updated with an already-settled
    // promise, we don't blink into the `pending` state and render that for a moment
    // before then moving to the correct resolution.
    if (
      this.args.expectSettledPromises === false ||
      (await Promise.race([promise, PENDING])) === PENDING
    ) {
      this.state = { state: 'pending', previous };
    }
  }

  private maybeUpdate(promise: Promise<T>, newState: AsyncState<T>): void {
    if (promise === this.lastPromise) {
      this.state = newState;
    }
  }
}
