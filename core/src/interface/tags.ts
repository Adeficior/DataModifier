import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import type { IdInput, TagInput } from "../common/id";

export interface TagRegistryHolder {
  registry<T extends RegistryId>(key: T): TagRegistry<T>;
}

export interface TagRegistry<T extends RegistryId> {
  contains(id: TagInput, entry: IdInput<InferIds<T>>): boolean;

  list(): string[];

  // TODO I need those here or can they also just return IDs?
  get(id: TagInput): TagEntry<InferIds<T>>[] | undefined;

  resolve(id: TagInput): TagEntry<InferIds<T>>[];
}
