import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import type { TagRegistry } from "../loader/tags.js";
import type { IdInput, NormalizedId, TagInput } from "./id.js";
import { encodeId } from "./id.js";

export type Predicate<T> = (value: T) => boolean;
export type CommonFilter<T> = RegExp | Predicate<T> | T;

export function createIdPredicate<TEntry, TId extends string>(
  test: CommonFilter<TId>,
  resolve: (value: TEntry) => NormalizedId<TId>[],
  tags?: TagRegistry<RegistryId>,
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

export function resolveIDTest<T extends RegistryId>(
  test: CommonFilter<NormalizedId<InferIds<T>>>,
  tags?: TagRegistry<T>,
): Predicate<IdInput<InferIds<T>>> {
  return createIdPredicate<IdInput<InferIds<T>>, NormalizedId<InferIds<T>>>(
    test,
    (it) => [encodeId(it)],
    tags,
  );
}
