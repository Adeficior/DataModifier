import type {
  IdInput,
  NormalizedId,
  RegistryLookup,
  TagInput,
} from "@adeficior/data-modifier-core";
import { encodeId } from "@adeficior/data-modifier-core";
import type {
  CommonFilter,
  Predicate,
} from "@adeficior/data-modifier-core/serializer";
import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import type { TagRegistry } from "./schema";

export function createIdPredicate<TEntry, TId extends string>(
  filter: CommonFilter<TId>,
  resolve: (value: TEntry) => NormalizedId<TId>[],
  tags?: TagRegistry<RegistryId>,
): Predicate<TEntry> {
  if (typeof filter === "function") {
    return (entry) => resolve(entry).some((id) => filter(id as TId));
  } else if (filter instanceof RegExp) {
    return (value) => {
      return resolve(value).some((it) => filter.test(it));
    };
  } else if (filter.startsWith("#")) {
    return (value) => {
      return resolve(value).some((id) => {
        if (id.startsWith("#") && filter === id) return true;
        else if (tags) return tags.contains(filter as TagInput, id) ?? false;
        else throw new Error("Cannot parse ID test without tags");
      });
    };
  } else {
    return (value) => {
      return resolve(value).includes(encodeId(filter));
    };
  }
}

export type IdFilterContext<T extends RegistryId = RegistryId> = {
  registry: T;
  lookup: RegistryLookup;
  tags?: TagRegistry<T>;
};

export function resolveIdFilter<T extends RegistryId>(
  filter: CommonFilter<NormalizedId<InferIds<T>>>,
  context?: IdFilterContext<T>,
): Predicate<IdInput<InferIds<T>>> {
  if (context && typeof filter === "string" && !filter.startsWith("#")) {
    context.lookup.validateEntry(context.registry, filter);
  }

  return createIdPredicate<IdInput<InferIds<T>>, NormalizedId<InferIds<T>>>(
    filter,
    (it) => [encodeId(it)],
    context?.tags,
  );
}
