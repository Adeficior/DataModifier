import type { Predicate } from "../io";

export type Replacer<T> = (value: T) => T;

export function createReplacer<T>(from: Predicate<T>, to: T): Replacer<T> {
  return (it: T) => {
    if (from(it)) return to;
    return it;
  };
}
