import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import type { IdInput, NormalizedId, TagInput } from "../common/id";
import { encodeId } from "../common/id";

export type TagChecker<T extends RegistryId> = {
  contains(id: TagInput, entry: IdInput<InferIds<T>>): boolean;
};

export type Predicate<T> = (value: T) => boolean;
export type CommonFilter<T> = RegExp | Predicate<T> | T;

export function createIdPredicate<TEntry, TId extends string>(
  test: CommonFilter<TId>,
  resolve: (value: TEntry) => NormalizedId<TId>[],
  tags?: TagChecker<RegistryId>,
): Predicate<TEntry> {
  if (typeof test === "function") {
    return (entry) => resolve(entry).some((id) => test(id as TId));
  } else if (test instanceof RegExp) {
    return (ingredient) => {
      return resolve(ingredient).some((it) => test.test(it));
    };
  } else if (test.startsWith("#")) {
    return (ingredient) => {
      return resolve(ingredient).some((id) => {
        if (id.startsWith("#") && test === id) return true;
        else if (tags) return tags.contains(test as TagInput, id) ?? false;
        else throw new Error("Cannot parse ID test without tags");
      });
    };
  } else {
    return (ingredient) => {
      return resolve(ingredient).includes(encodeId(test));
    };
  }
}

// TODO this needs to be in core still somehow?
// incorrect, can be moved to tags
export function resolveIdTest<T extends RegistryId>(
  test: CommonFilter<NormalizedId<InferIds<T>>>,
  tags?: TagChecker<T>,
): Predicate<IdInput<InferIds<T>>> {
  return createIdPredicate<IdInput<InferIds<T>>, NormalizedId<InferIds<T>>>(
    test,
    (it) => [encodeId(it)],
    tags,
  );
}

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
