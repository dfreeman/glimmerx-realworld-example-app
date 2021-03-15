import * as marked from 'marked';
import { assert } from './debug';

/**
 * Indicates that a particular location in control flow should never
 * be reached. This is witnessed in the type system by a value of type
 * `never`, which should only be obtainable by ruling out all possible
 * values it could have had.
 */
export const unreachable = (_value: never): never => {
  throw new Error('Internal error: unreachable code... reached!');
};

/** console.log */
export const log = (...values: Array<unknown>): void => console.log(...values);

/** `!` */
export const not = (value: unknown): boolean => !value;

/** `===` */
export const eq = <T>(left: unknown, right: T): left is T => left === right;

/** Joins an array */
export const join = (items: Array<unknown>, separator?: string): string => {
  return items.join(separator ?? ' ');
};

/* Invokes the given callback when the given value changes */
export const onChange = (_value: unknown, callback: () => void): void => callback();

/** Generates HTML from markdown */
export const markdown = (source: string): string => marked.parse(source);

/** Generate an array containing an (inclusive) range of integers */
export const range = (start: number, end: number): Array<number> => {
  return Array.from(Array(end - start), (_, i) => start + i);
};

/** A convenience helper for pulling data out of a form. */
export const gatherFormData = (
  callback: (data: Record<string, string | null>, form: HTMLFormElement) => void
): ((event: Event) => void) => {
  return (event) => {
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
};

/** Returns a human readable date */
export const humanizeDate = (date: string): string => {
  return new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

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
export const is = <T, K extends keyof T, V extends T[K] & (string | number | boolean | symbol)>(
  obj: T,
  key: K,
  value: V
): obj is Extract<T, Record<K, V>> => {
  return obj[key] === value;
};
