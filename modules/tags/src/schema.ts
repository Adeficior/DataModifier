import { type IdInput, type TagInput } from "@adeficior/data-modifier-core";
import {
  type InferIds,
  type RegistryId,
} from "@adeficior/data-modifier/generated";

export type TagDefinition = Readonly<{
  replace?: boolean;
  values?: TagEntry[];
  remove?: TagEntry[];
}>;

export type TagEntry<T extends string = string> =
  | T
  | `#${string}`
  | Readonly<{
      required?: boolean;
      id: T | `#${string}`;
    }>;

export interface TagRegistryHolder {
  registry<T extends RegistryId>(key: T): TagRegistry<T>;
}

export interface TagRegistry<T extends RegistryId> {
  contains(id: TagInput, entry: IdInput<InferIds<T>>): boolean;

  list(): string[];

  get(id: TagInput): TagEntry<InferIds<T>>[] | undefined;

  resolve(id: TagInput): TagEntry<InferIds<T>>[];
}
