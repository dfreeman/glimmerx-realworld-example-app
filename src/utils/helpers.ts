import { helper as glimmerXHelper } from '@glimmerx/helper';
import * as marked from 'marked';
import { assert } from './debug';

/**
 * A slightly more convenient signature for making helpers. Notably,
 * positional params appear at the top level, meaning that they can
 * be the target of type assertions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function helper<T extends (...params: any) => any>(f: T): T {
  return glimmerXHelper((positional, named) => f(named, ...positional)) as T;
}

/**
 * Indicates that a particular location in control flow should never
 * be reached. This is witnessed in the type system by a value of type
 * `never`, which should only be obtainable by ruling out all possible
 * values it could have had.
 */
export const unreachable = helper(({}, value: never) => {
  throw new Error('Internal error: unreachable code... reached!');
});

/** console.log */
export const log = helper(({}, ...values: Array<unknown>) => console.log(...values));

/** `!` */
export const not = helper(({}, value: unknown) => !value);

/** `===` */
export const eq = helper(<T>({}, left: unknown, right: T): left is T => left === right);

/** Joins an array */
export const join = helper((args: { separator?: string }, items: Array<unknown>) => {
  return items.join(args.separator ?? ' ');
});

/* Invokes the given callback when one of the passed values changes */
export const onChange = helper((args: { callback(): void }, ...values: Array<unknown>) =>
  args.callback()
);

/** Generates HTML from markdown */
export const markdown = helper(({}, source: string) => marked.parse(source));

/** Generate an array containing an (inclusive) range of integers */
export const range = helper(({}, start: number, end: number) => {
  return Array.from(Array(end - start), (_, i) => start + i);
});

/** A convenience helper for pulling data out of a form. */
export const gatherFormData = helper(
  ({}, callback: (data: Record<string, string | null>, form: HTMLFormElement) => void) => {
    return (event: Event) => {
      event.preventDefault();

      assert(event.target instanceof HTMLFormElement);

      let data: Record<string, string | null> = {};
      for (let [field, value] of new FormData(event.target).entries()) {
        if (typeof value === 'string') {
          data[field] = value || null;
        }
      }
      callback(data, event.target);
    };
  }
);

/** Returns a human readable date */
export const humanizeDate = helper(({}, date: string) => {
  return new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

/**
 * Because templates don't have a native notion of equality, there's no
 * in-built way to do type narrowing based on a discriminator field. In
 * other words, there's no way to do something like this in a template:
 *
 * ```ts
 * declare const x: { type: 'person'; name: string } | { type: 'animal' };
 *
 * if (x.type === 'person') {
 *   x.name; // TS understands this is a string
 * }
 * ```
 *
 * This helper is the closest we can come:
 *
 * ```hbs
 * {{#if (is x 'type' 'person')}}
 *   {{x.name}}
 * {{/if}}
 * ```
 */
export const is = helper(
  <T, K extends keyof T, V extends T[K] & (string | number | boolean | symbol)>(
    {},
    obj: T,
    key: K,
    value: V
  ): obj is Extract<T, Record<K, V>> => {
    return obj[key] === value;
  }
);
