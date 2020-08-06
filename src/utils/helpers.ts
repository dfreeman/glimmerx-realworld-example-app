import { helper as glimmerXHelper } from '@glimmerx/helper';

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
