export type Predicate<T> = (value: T) => boolean;
export type CommonFilter<T> = RegExp | Predicate<T> | T;

/**
 * @returns a predicate being true if all given predicates are true
 */
export function every<T>(predicates: Predicate<T>[]): Predicate<T> {
  return (...args) => predicates.every((it) => it(...args));
}

/**
 * @returns a predicate being true if any one of the given predicates is true
 */
export function any<T>(predicates: Predicate<T>[]): Predicate<T> {
  return (...args) => predicates.some((it) => it(...args));
}

/**
 * @returns a predicate being true if the given predicate if true for some value in the array
 */
export function some<T>(predicate: Predicate<T>): Predicate<T[]> {
  return (values, ...args) => values.some((it) => predicate(it, ...args));
}

/**
 * @returns a predicate that is always true
 */
export function always<T>(): Predicate<T> {
  return () => true;
}

/**
 * @returns a predicate that is always false
 */
export function never<T>(): Predicate<T> {
  return () => false;
}
