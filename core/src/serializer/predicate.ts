import {
  type InferIds,
  type RegistryId,
} from "@adeficior/data-modifier/generated";
import {
  encodeId,
  type IdInput,
  type NormalizedId,
  type TagInput,
} from "../common/id";

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

export function every<T>(...predicates: Predicate<T>[]): Predicate<T> {
  return (...args) => predicates.every((it) => it(...args));
}

export function any<T>(...predicates: Predicate<T>[]): Predicate<T> {
  return (...args) => predicates.some((it) => it(...args));
}
