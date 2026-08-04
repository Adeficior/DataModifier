import type { IdInput } from "../../common/id";
import { createId } from "../../common/id";

export type TagEntry<T extends string = string> =
  | T
  | `#${string}`
  | Readonly<{
      required?: boolean;
      id: T | `#${string}`;
    }>;

export type TagDefinition = Readonly<{
  replace?: boolean;
  values?: TagEntry[];
  remove?: TagEntry[];
}>;

export function tagFolderOf(registry: IdInput) {
  const { path } = createId(registry);
  return path;
}
